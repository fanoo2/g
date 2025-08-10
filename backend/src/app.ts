import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { JwtUser, GiftSocketPayload, GiftReceivedEvent } from 'shared-types';
import { config } from './config.js';
import { calcXpGain, calcLevel } from './xp.js';

dotenv.config();

// --- Config ---
const MONGO_URL = config.mongoUrl;
const REDIS_URL = config.redisUrl;
const JWT_SECRET = config.jwtSecret;
const REFRESH_SECRET = config.refreshSecret;

// --- Mongo Models ---
interface IUser extends mongoose.Document { handle: string; password?: string; tokens: number; xp: number; level: number; roles: string[]; }
const UserSchema = new mongoose.Schema<IUser>({
  handle: { type: String, unique: true, required: true },
  password: { type: String },
  tokens: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  roles: { type: [String], default: ['viewer'] }
},{ timestamps: true });
const User = mongoose.model<IUser>('User', UserSchema);

interface IGift extends mongoose.Document { code: string; name: string; tokenCost: number; animationKey?: string; commandAction?: string; }
const GiftSchema = new mongoose.Schema<IGift>({
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  tokenCost: { type: Number, required: true },
  animationKey: String,
  commandAction: String
});
const Gift = mongoose.model<IGift>('Gift', GiftSchema);

interface IGiftEvent extends mongoose.Document { giftCode: string; fromUser: mongoose.Types.ObjectId; streamId?: string; tokens: number; commandAction?: string; }
const GiftEventSchema = new mongoose.Schema<IGiftEvent>({
  giftCode: String,
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  streamId: String,
  tokens: Number,
  commandAction: String
},{ timestamps: { createdAt: true, updatedAt: false } });
const GiftEvent = mongoose.model<IGiftEvent>('GiftEvent', GiftEventSchema);

// --- Redis Leaderboards ---
const redis = new Redis(REDIS_URL);
const LEADERBOARD_KEY = 'leaderboard:giftTokens';

// --- Express App ---
const app = express();
app.use(cors({ origin: (origin, cb)=> {
  if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
  return cb(new Error('CORS blocked')); }, credentials: true }));
app.use(express.json());

// --- Util ---
function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// --- Routes ---
app.get('/api/health', (_req: express.Request, res: express.Response) => res.json({ status: 'ok' }));

// Rate limiting (basic global limiter)
const apiLimiter = rateLimit({ windowMs: 60_000, max: 120 });
app.use('/api/', apiLimiter);

// Auth: simple register/login (demo; no hashing or validation hardening yet)
const registerSchema = z.object({ handle: z.string().min(3).max(30), password: z.string().min(6) });
app.post('/api/auth/register', async (req: express.Request, res: express.Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { handle, password } = parsed.data;
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ handle, password: hash, tokens: 100 });
  const token = jwt.sign({ id: user._id, handle: user.handle }, JWT_SECRET, { expiresIn: '15m' });
  const refresh = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '30d' });
  res.json({ token, refresh, user: { id: user._id, handle: user.handle, tokens: user.tokens } });
  } catch (e:any) {
    res.status(400).json({ error: e.message });
  }
});

const loginSchema = z.object({ handle: z.string(), password: z.string() });
app.post('/api/auth/login', async (req: express.Request, res: express.Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { handle, password } = parsed.data;
  const user = await User.findOne({ handle });
  if (!user) return res.status(404).json({ error: 'not found' });
  const ok = await bcrypt.compare(password, user.password || '');
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ id: user._id, handle: user.handle }, JWT_SECRET, { expiresIn: '15m' });
  const refresh = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '30d' });
  res.json({ token, refresh, user: { id: user._id, handle: user.handle, tokens: user.tokens } });
});

// Refresh token endpoint
app.post('/api/auth/refresh', async (req: express.Request, res: express.Response) => {
  const { refresh } = req.body || {};
  if (!refresh) return res.status(400).json({ error: 'missing refresh' });
  try {
    const payload = jwt.verify(refresh, REFRESH_SECRET) as any;
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: 'not found' });
    const token = jwt.sign({ id: user._id, handle: user.handle }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ token });
  } catch { return res.status(401).json({ error: 'invalid refresh' }); }
});

// Purchase/top-up stub (simulate Stripe success)
const topUpSchema = z.object({ amount: z.number().int().positive().max(100000) });
app.post('/api/wallet/topup', authMiddleware, async (req: any, res) => {
  const parsed = topUpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  user.tokens += parsed.data.amount; // 1:1 token per unit; adjust with pricing later
  await user.save();
  res.json({ balance: user.tokens });
});

// Gift catalog CRUD (minimal)
const giftSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  tokenCost: z.number().int().positive(),
  animationKey: z.string().optional(),
  commandAction: z.string().optional()
});
app.post('/api/gifts', authMiddleware, async (req: express.Request, res: express.Response) => {
  const parsed = giftSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const gift = await Gift.create(parsed.data);
    res.json(gift);
  } catch (e:any) { res.status(400).json({ error: e.message }); }
});
app.get('/api/gifts', async (_req: express.Request, res: express.Response) => {
  const gifts = await Gift.find();
  res.json(gifts);
});

// Leaderboard
app.get('/api/leaderboard/gifts', async (_req: express.Request, res: express.Response) => {
  const top = await redis.zrevrange(LEADERBOARD_KEY, 0, 19, 'WITHSCORES');
  const enriched: any[] = [];
  for (let i=0; i<top.length; i+=2) {
    const userId = top[i];
    const score = Number(top[i+1]);
    const u = await User.findById(userId).select('handle');
    enriched.push({ userId, handle: u?.handle, score });
  }
  res.json({ entries: enriched });
});

// --- Server & Socket ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.corsOrigins, credentials: true } });
const chatNs = io.of('/chat');
const giftsNs = io.of('/gifts');

type SocketUser = { id: string; handle: string };

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(); // allow anonymous read
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (socket as any).user = { id: payload.id, handle: payload.handle } as SocketUser;
  } catch { /* ignore invalid */ }
  next();
});

chatNs.on('connection', (socket) => {
  socket.emit('welcome', { message: 'Connected to chat namespace' });
  socket.on('chat:message', (msg) => { chatNs.emit('chat:message', msg); });
});

giftsNs.on('connection', (socket) => {
  socket.emit('welcome', { message: 'Connected to gifts namespace' });
  socket.on('gift:send', async (payload: GiftSocketPayload) => {
    const user: SocketUser | undefined = (socket as any).user;
    if (!user) return socket.emit('error', { error: 'auth required for gifts' });
    if (!payload?.code) return socket.emit('error', { error: 'missing code' });
    const gift = await Gift.findOne({ code: payload.code });
    if (!gift) return socket.emit('error', { error: 'gift not found' });
    const dbUser = await User.findById(user.id);
    if (!dbUser) return socket.emit('error', { error: 'user not found' });
    if (dbUser.tokens < gift.tokenCost) return socket.emit('error', { error: 'insufficient tokens' });
    dbUser.tokens -= gift.tokenCost;
    dbUser.xp += calcXpGain(gift.tokenCost);
    dbUser.level = calcLevel(dbUser.xp);
    await dbUser.save();
    await GiftEvent.create({ giftCode: gift.code, fromUser: dbUser._id, tokens: gift.tokenCost, commandAction: gift.commandAction });
    await redis.zincrby(LEADERBOARD_KEY, gift.tokenCost, (dbUser._id as mongoose.Types.ObjectId).toString());
    const event: GiftReceivedEvent = { code: gift.code, from: dbUser.handle, tokens: gift.tokenCost, commandAction: gift.commandAction };
    giftsNs.emit('gift:received', event);
  });
});

// xp utilities moved to xp.ts

async function seedGifts() {
  const count = await Gift.countDocuments();
  if (count === 0) {
    await Gift.insertMany([
      { code: 'HEART', name: 'Heart', tokenCost: 10, animationKey: 'heart-pop' },
      { code: 'STAR', name: 'Star', tokenCost: 25, animationKey: 'star-burst' },
      { code: 'FIRE', name: 'Fire', tokenCost: 50, animationKey: 'flame-rise', commandAction: 'overlay:fire' }
    ]);
    console.log('Seeded default gifts');
  }
}

async function start() {
  await mongoose.connect(MONGO_URL);
  console.log('Mongo connected');
  await seedGifts();
  server.listen(process.env.PORT || 4000, () => console.log('Backend listening'));
}

start().catch(err => { console.error(err); process.exit(1); });
