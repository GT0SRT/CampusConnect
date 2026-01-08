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

def process_image_with_gemini(image_input: str, instruction: str = "detailed description"):
    """
    Robustly handles URLs and Base64 strings with Auto-Padding Fix.
    """
    try:
        image_data = None

        if image_input.startswith(('http://', 'https://')):
            print(f"Downloading image from URL...")
            response = requests.get(image_input)
            response.raise_for_status()
            image_data = response.content        
        else:
            if "," in image_input:
                image_input = image_input.split(",")[1]
            
            image_input = image_input.strip().replace("\n", "").replace(" ", "")

            # Base64 length must be divisible by 4. (padding error)
            # This formula calculates exactly how many '=' are needed.
            missing_padding = len(image_input) % 4
            if missing_padding:
                image_input += '=' * (4 - missing_padding)

            try:
                image_data = base64.b64decode(image_input)
            except Exception as e:                
                raise ValueError(f"Base64 decoding failed even after padding fix: {str(e)}")

        if not image_data:
            raise ValueError("No image data processed.")
                
        try:
            image = Image.open(io.BytesIO(image_data))
        except Exception:
            raise ValueError("The bytes could not be identified as an image. File might be corrupted.")

        if image.mode != 'RGB':
            image = image.convert('RGB')

        output_buffer = io.BytesIO()
        image.save(output_buffer, format='JPEG', quality=95)
        clean_image_data = output_buffer.getvalue()

        model = genai.GenerativeModel('models/gemini-2.5-flash-lite')

        final_prompt = (
            "Act as a Gen Z social media user posting this photo to social media. "
            f"Write a caption that is {instruction}. "
            "STRICT RULES:\n"
            "1. Length: MAXIMUM 15 to 30 words for the caption text.\n"
            "2. Do NOT describe the image visually (e.g., do NOT say 'This image shows' or 'In this photo').\n"
            "3. Write as if YOU took the photo (use 'I', 'my', 'we').\n"
            "4. Add 3-5 relevant hashtags at the end.\n"
            "5. Output format: Just the text and hashtags. Nothing else."
        )

        response = model.generate_content([
            final_prompt,
            {
                "mime_type": "image/jpeg",
                "data": clean_image_data
            }
        ], generation_config={
            "max_output_tokens": 64,
            "temperature": 0.7
        })

        return response.text

    except requests.exceptions.RequestException as e:
        raise Exception(f"Image Download Failed: {str(e)}")
    except Exception as e:
        raise Exception(f"Gemini Processing Error: {str(e)}")