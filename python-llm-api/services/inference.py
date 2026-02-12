import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from services.cleaner import TextCleaner

class InferenceService:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash", # Using stable 2.0-flash
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.7,
        )
        self.system_instruction = (
            "<role>Expert Multi-domain Assistant</role>"
            "<task>Provide accurate, concise information. Use Markdown.</task>"
        )
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_instruction),
            ("human", "{message}")
        ])
        self.chain = self.prompt | self.llm

    async def stream_generate(self, message: str):
        """Yields cleaned chunks of text from Gemini."""
        async for chunk in self.chain.astream({"message": message}):
            if chunk.content:
                yield TextCleaner.clean_chunk(chunk.content)