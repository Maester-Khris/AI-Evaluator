import os
from groq import Groq, AsyncGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from services.cleaner import TextCleaner

# =========== previous implementation with gemini ===========
# self.llm = ChatGoogleGenerativeAI(
#     model="gemini-2.0-flash", # Using stable 2.0-flash
#     google_api_key=os.getenv("GEMINI_API_KEY"),
#     temperature=0.7,
# )


# class InferenceService:
#     def __init__(self):
#         self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
#         self.model = "llama-3.1-8b-instant"  # Or llama-3.3-70b-versatile

#     async def stream_generate(self, prompt: str):
#         # Note: Groq's Python SDK is synchronous by default,
#         # so we wrap the stream or use their async client.
#         stream = self.client.chat.completions.create(
#             messages=[{"role": "user", "content": prompt}],
#             model=self.model,
#             stream=True,
#         )

#         for chunk in stream:
#             if chunk.choices[0].delta.content:
#                 yield chunk.choices[0].delta.content

class InferenceService:
    def __init__(self):
        self.client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

    async def check_readiness(self):
        """Probes the AI provider for a minimal response to confirm API key/quota."""
        try:
            # Simple metadata check or low-token completion
            await self.client.models.retrieve(self.model)
            return True
        except Exception:
            return False

    async def stream_generate(self, prompt: str):
        # Full async streaming to match Node.js Socket.io expectations
        stream = await self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=self.model,
            stream=True,
        )
        async for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content


class InferenceServiceV0:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",  # Using stable 2.0-flash
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.7,
        )
        self.system_instruction = (
            "<role>Expert Multi-domain Assistant</role>"
            "<task>Provide accurate, concise information. Use Markdown.</task>"
        )
        self.prompt = ChatPromptTemplate.from_messages(
            [("system", self.system_instruction), ("human", "{message}")]
        )
        self.chain = self.prompt | self.llm

    async def stream_generate(self, message: str):
        """Yields cleaned chunks of text from Gemini."""
        async for chunk in self.chain.astream({"message": message}):
            if chunk.content:
                yield TextCleaner.clean_chunk(chunk.content)
