import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
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
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    # Basic liveness check. In production, you'd check DB/Gemini connectivity here.
    return {"status": "healthy", "model": "gemini-2.5-flash"}



# 1. Define the datasctructure
# 2. Define the structure output (what the model should return)
# class MessageRequest(BaseModel):
#     message: str

# class GenAIResponse(BaseModel):
#     response: str = Field(description="The AI-generated response to the input message.")

# 3. Initialise Gemini 
# llm = ChatGoogleGenerativeAI(
#     model = "gemini-2.5-flash",
#     google_api_key = os.getenv("GEMINI_API_KEY")
# )
# --- LangChain Setup ---
# Note: Ensure you are using "gemini-1.5-flash" or "gemini-2.0-flash" 
# gemini-2.5 is not a standard stable ID yet; 2.0-flash is currently the speed king.
# llm = ChatGoogleGenerativeAI(
#     model="gemini-2.5-flash", 
#     google_api_key=os.getenv("GEMINI_API_KEY"),
#     temperature=0.7,
# )

# 4. Create the message response Logic
# 2. Refined High-Performance Prompt (XML structure for better Gemini parsing)
# structured_llm = llm.with_structured_output(GenAIResponse)
# system_instruction = (
#     "<role>Expert Multi-domain Assistant</role>"
#     "<task>Provide accurate, concise information. Use Markdown for clarity.</task>"
#     "<constraints>No conversational filler. Start responding immediately.</constraints>"
# )
# prompt = ChatPromptTemplate.from_messages([
#     ("system", system_instruction),
#     ("human", "{message}") 
# ])


# Chains
# json_chain = prompt | structured_llm
# stream_chain = prompt | llm  # Raw LLM for streaming text


# VERSION 1: Standard JSON (Wait for full response)
# This will still take time for long responses
# @app.post("/generate-response", response_model=GenAIResponse)
# async def generate_response(request: MessageRequest):
#     try:
#         # return await json_chain.ainvoke({"message": request.message})
#         # 1. Get raw response (skip Pydantic parsing inside LangChain for a second)
#         raw_result = await json_chain.ainvoke({"message": request.message})
        
#         # 2. Clean the string if it's not already a dict
#         if isinstance(raw_result.response, str):
#             cleaned_text = TextCleaner.clean_json_string(raw_result.response)
#             return {"response": cleaned_text}
            
#         return raw_result
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# VERSION 2: Streaming (Real-time token delivery)
# astream() yields AIMessageChunks
# Send as raw text or Server-Sent Events (SSE)
# @app.post("/generate-response-stream")
# async def generate_response_stream(request: MessageRequest):
#     async def event_generator():
#         try:
#             async for chunk in stream_chain.astream({"message": request.message}):
#                 if chunk.content:
#                     # yield chunk.content
#                     yield TextCleaner.clean_chunk(chunk.content)
#         except Exception as e:
#             yield f"Error: {str(e)}"

#     return StreamingResponse(event_generator(), media_type="text/plain")