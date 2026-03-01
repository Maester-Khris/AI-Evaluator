import type { NextFunction, Request, Response } from "express";
import { AuthService } from "../api/auth/auth.service.js";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "No authorization header" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = await AuthService.verifyToken(token);
        (req as any).user = {
            id: decoded.userId,
            role: decoded.role,
            isGuest: (decoded as any).isGuest === true
        };
        next();
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};
