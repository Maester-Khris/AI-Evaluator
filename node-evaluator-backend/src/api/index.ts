// src/api/index.ts
import { Router } from 'express';
import authRoutes from './auth/auth.routes.js';
import chatRoutes from './chat/chat.routes.js'; // fixed extension for consistency

const rootRouter = Router();

// Registering feature routers with prefixes
rootRouter.use('/auth', authRoutes);
rootRouter.use('/chat', chatRoutes);

export default rootRouter;