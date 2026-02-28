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


def generate_interview_prompt_with_gemini(
    *,
    company: str,
    role_name: str,
    topics: str,
    resume_summary: str,
    difficulty: str = "moderate",
):
    """
    Generate a complete one-time interview system prompt using Gemini.
    This prompt is intended to be reused by Groq for all interview turns.
    """
    try:
        safe_company = (company or "Tech Company").strip()
        safe_role = (role_name or "Software Engineer").strip()
        safe_topics = (topics or "General").strip()
        safe_resume = (resume_summary or "No resume provided").strip()
        safe_difficulty = (difficulty or "moderate").strip().lower()
        if safe_difficulty not in {"basic", "moderate", "tough"}:
            safe_difficulty = "moderate"

        model = genai.GenerativeModel("models/gemini-2.5-flash")

        request_prompt = f"""
You are an expert prompt engineer.
Generate ONE complete, production-ready SYSTEM PROMPT for a Groq-based AI interviewer.

Interview inputs:
- Company: {safe_company}
- Role: {safe_role}
- Topics: {safe_topics}
- Difficulty: {safe_difficulty}
- Candidate Resume Summary: {safe_resume}

Required behavior for the generated system prompt:
1) Real-life interview simulation with natural interviewer-candidate communication & some name for interviewer.
2) Voice-first style: concise responses, one question at a time, smooth transitions.
3) Interview flow guidance: intro, resume/projects, core technical/role questions, behavioral, company motivation, closing.
4) Strong adaptation rules based on candidate response quality.
5) Explicit difficulty calibration using the provided difficulty.
6) Keep interviewer professional, realistic, and consistent across turns.
7) Include strict output contract for Groq model response as JSON only:
   {{
     "reply": "string",
     "allotted_time_sec": 20-90,
     "interview_ended": true|false,
     "end_call_prompted": true|false
   }}
8) Include end-call logic guidance and when to set end_call_prompted/interview_ended.
9) English only.

Output rules:
- Return ONLY the final system prompt text.
- Do NOT wrap in markdown.
- Do NOT return explanation.
""".strip()

        response = model.generate_content(request_prompt)
        generated_prompt = (response.text or "").strip()

        if not generated_prompt:
            raise ValueError("Gemini returned an empty prompt")

        return generated_prompt
    except Exception as e:
        print(f"Gemini Interview Prompt Error: {e}")
        raise

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
        raise RuntimeError("Gemini image processing failed") from e