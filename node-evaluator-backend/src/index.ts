
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import apiRouter from './api/index.js';
import { prisma } from './config/prisma.js';
import { redisConfig } from './config/redis.js';
import { redisStream } from './services/redis-streaming.js';
import { emitToRoom, initSocketManager } from './services/socket-manager.js';

import { randomUUID } from 'node:crypto';

export const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173', // Vite default
  'http://127.0.0.1:5173',
];

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(cors(({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Required if you decide to use cookies/sessions later
})));
app.use(express.json());

// Basic Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'active', timestamp: new Date().toISOString() });
});
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});


// Create the HTTP Server manually
const httpServer = http.createServer(app);
const startServer = async () => {
  try {
    // Ensure Redis is ready before we accept chat messages
    // Ensure Redis is ready before we accept chat messages
    await redisConfig.connect();
    const isRedisReady = await redisConfig.testConnection();
    if (!isRedisReady) {
      throw new Error('Redis connection failed');
    }
    console.log('Redis connected and verified successfully');


    // 1. Initialize Socket.io and pass the httpServer
    initSocketManager(httpServer);

    // 2. Wire up the event from Redis -> Socket.io
    // This is the "glue" that prevents circular dependency
    redisStream.eventEmitter.on('chunk_received', (data) => {
      emitToRoom(data.roomId, 'ai_chunk', {
        conversationId: data.conversationId,
        chunk: data.content,
        isDone: data.isDone
      });
    });

    redisStream.eventEmitter.on('ai_request', (data) => {
      console.log("AI Request:", data);
      redisStream.pushToInferenceQueue(data).then((id) => {
        console.log("Redis Push Result ID:", id);
      });
    });

    // 2. Start listening for results from Python (via Redis)
    redisStream.listenForLLMResults();

    if (process.env.NODE_ENV !== 'test') {
      httpServer.listen(PORT, () => {
        console.log(`AI Evaluator Backend running at http://localhost:${PORT}`);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

// await redisStream.pushToInferenceQueue({
//   roomId: 'test room id',
//   correlationId: randomUUID(), // Cast if UUID type mismatch
//   userId: randomUUID(),
//   conversationId: randomUUID(),
//   message: 'test',
//   context: [] // Future: Add last 2-3 messages for context here
// });