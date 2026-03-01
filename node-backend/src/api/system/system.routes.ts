import { Router } from "express";
import { prisma } from "../../config/prisma.js";
import { redisConfig } from "../../config/redis.js";

const router = Router();

router.get("/health", async (req, res) => {
    const status: any = {
        status: "active",
        timestamp: new Date().toISOString(),
        dependencies: {
            database: "unknown",
            redis: "unknown",
            pythonServer: "unknown",
        },
    };

    // Check Database
    try {
        if (!prisma) {
            status.dependencies.database = "initializing";
        } else {
            await prisma.$queryRaw`SELECT 1`;
            status.dependencies.database = "connected";
        }
    } catch (e) {
        console.error("Database health check failed:", e);
        status.dependencies.database = "error";
    }

    // Check Redis
    try {
        const isRedisReady = await redisConfig.testConnection();
        status.dependencies.redis = isRedisReady ? "connected" : "error";
    } catch (e) {
        console.error("Redis health check failed:", e);
        status.dependencies.redis = "error";
    }

    // Check Python Server
    try {
        const pythonUrl = `${process.env.PYTHON_API_HOST}/health`;
        const pythonRes = await fetch(pythonUrl);
        status.dependencies.pythonServer = pythonRes.ok ? "connected" : "error";
    } catch (e) {
        console.error("Python Server health check failed:", e);
        status.dependencies.pythonServer = "error";
    }

    const overallError = Object.values(status.dependencies).includes("error");
    if (overallError) {
        status.status = "degraded";
        return res.status(503).json(status);
    }

    res.json(status);
});

export default router;
