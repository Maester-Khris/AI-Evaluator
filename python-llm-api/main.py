import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from services.cleaner import TextCleaner

# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = FastAPI(title="AI Evaluator, Google Generative Inference Service")


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
async def health_check():
    # Basic liveness check. In production, you'd check DB/Gemini connectivity here.
    return {"status": "healthy", "model": "gemini-2.5-flash"}
