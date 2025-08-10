import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.emit('welcome', { message: 'Connected to realtime gateway' });
  socket.on('chat:message', (msg) => {
    io.emit('chat:message', msg);
  });
  socket.on('gift:send', (gift) => {
    // naive broadcast; later add validation, balances, anti-fraud
    io.emit('gift:received', gift);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
});
