import dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/livestream',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'devrefresh',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',')
};
