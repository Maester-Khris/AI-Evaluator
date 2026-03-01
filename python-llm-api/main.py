import json
import os
import asyncio

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
import redis.asyncio as redis
from services.inference import InferenceService
from services.cleaner import TextCleaner

load_dotenv()

# --- Global State Container ---
class AppState:
    def __init__(self):
        self.redis = None
        self.inference = None
        self.worker_task = None
        self.is_healthy = True

state = AppState()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    state.redis = redis.from_url(os.getenv("REDIS_URL"), decode_responses=True)
    state.inference = InferenceService()
    
    # Inject the worker loop from your previous worker.py logic
    from internal.worker_loop import start_worker_loop
    state.worker_task = asyncio.create_task(start_worker_loop(state.redis, state.inference))
    
    print("Inference Service & Background Worker Started")
    yield
    # --- Shutdown ---
    state.worker_task.cancel()
    await state.redis.close()
    print("Service Shutdown Complete")

app = FastAPI(title="AI Evaluator, Google Generative Inference Service", lifespan=lifespan)

# -------------------------- Endpoints ------------------------------
# 5. Create Rest endpoint: /home, /health, /generate-response
@app.get("/")
@app.get("/home")
async def home():
    return {
        "service": "AI Evaluator Inference API",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    # 1. Check Redis
    redis_up = await state.redis.ping()

    # 2. Check Groq/Gemini
    ai_up = await state.inference.check_readiness()
    
    status_code = 200 if (redis_up and ai_up) else 503
    return {
        "status": "operational" if status_code == 200 else "degraded",
        "checks": {
            "redis": "connected" if redis_up else "disconnected",
            "ai_provider": "ready" if ai_up else "unreachable",
            "worker_loop": "active" if not state.worker_task.done() else "failed"
        }
    }