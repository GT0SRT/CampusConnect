import os
import base64
import io
import re
from groq import Groq
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=api_key)
CHAT_MODEL = os.getenv("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile")

def chatbot(user_input: str):
    try:
        completion = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[
                {"role": "system", "content": "You are a Gen Z AI assistant. Reply in Hinglish, max 2 sentences."},
                {"role": "user", "content": user_input}
            ],
            temperature=0.7, max_tokens=100,
        )
        return completion.choices[0].message.content
    except Exception as e:
        raise RuntimeError("Groq chat request failed") from e