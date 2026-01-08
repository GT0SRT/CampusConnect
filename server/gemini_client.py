import google.generativeai as genai
import os
import base64
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)

def process_image_with_gemini(base64_string: str, instruction: str = "detailed description"):
    """
    Decodes base64 image and sends it to Gemini with a style instruction.
    """
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]

        image_data = base64.b64decode(base64_string)

        model = genai.GenerativeModel('models/gemini-2.5-pro')

        final_prompt = f"Analyze this image. Write a caption with tags that is {instruction}."
        
        response = model.generate_content([
            final_prompt,
            {
                "mime_type": "image/jpeg", # This works for png/jpg usually
                "data": image_data
            }
        ])

        return response.text

    except Exception as e:
        raise Exception(f"Gemini Error: {str(e)}")