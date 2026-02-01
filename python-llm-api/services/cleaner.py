import re
import json

class TextCleaner:
    @staticmethod
    def clean_json_string(text: str) -> str:
        """Removes markdown code blocks and invisible artifacts from JSON strings."""
        # 1. Remove Markdown code blocks like ```json ... ``` or ``` ... ```
        text = re.sub(r"```(?:json|markdown)?\n?", "", text)
        text = re.sub(r"\n?```", "", text)
        
        # 2. Strip leading/trailing whitespace and invisible characters
        text = text.strip()
        
        # 3. Fix common Gemini artifacts (like double escaped newlines)
        text = text.replace("\\n", "\n")
        
        return text

    @staticmethod
    def clean_chunk(chunk: str) -> str:
        """Cleans real-time streaming chunks to prevent UI 'flicker' from artifacts."""
        # Chunks are smaller, we mostly care about removing raw backticks 
        # that haven't formed a block yet.
        return chunk.replace("`", "").replace("\\n", "\n")