import google.generativeai as genai
import os
import base64
import io
import requests
from PIL import Image
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)

def process_image_with_gemini(image_input: str, instruction: str = "concise"):
    """
    Handles Image Captioning using Gemini 1.5 Flash.
    Optimized for speed with image resizing.
    """
    try:
        image_pil = None
        if image_input.startswith(('http://', 'https://')):
            response = requests.get(image_input)
            response.raise_for_status()
            image_pil = Image.open(io.BytesIO(response.content))
        else:
            if "," in image_input:
                image_input = image_input.split(",")[1]
            
            image_input = image_input.strip().replace("\n", "").replace(" ", "")
            missing_padding = len(image_input) % 4
            if missing_padding:
                image_input += '=' * (4 - missing_padding)

            decoded_bytes = base64.b64decode(image_input)
            image_pil = Image.open(io.BytesIO(decoded_bytes))

        if not image_pil:
            raise ValueError("Could not process image data.")

        if image_pil.mode != 'RGB':
            image_pil = image_pil.convert('RGB')
        
        image_pil.thumbnail((800, 800))
        
        img_byte_arr = io.BytesIO()
        image_pil.save(img_byte_arr, format='JPEG', quality=70)
        final_image = Image.open(img_byte_arr)
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        prompt = (
            "Act as a Gen Z social media user. "
            f"Write a caption that is {instruction}. "
            "RULES: Max 20 words, use emojis, NO visual description (don't say 'I see' or 'This is'), "
            "write as if you are in the photo or took it."
        )

        response = model.generate_content([prompt, final_image])
        
        return response.text

    except Exception as e:
        print(f"Gemini Error: {e}")
        return "error processing image"