// src/api/index.ts
import { Router } from "express";
import authRoutes from "./auth/auth.routes.js";
import chatRoutes from "./chat/chat.routes.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const rootRouter = Router();

// Registering feature routers with prefixes
rootRouter.use("/auth", authRoutes);
rootRouter.use("/chat", authMiddleware, chatRoutes);

export default rootRouter;
