
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './api/index.js';
import { prisma } from './config/prisma.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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

app.listen(PORT, () => {
  console.log(`AI Evaluator Backend running at http://localhost:${PORT}`);
});