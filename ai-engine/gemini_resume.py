import os
import fitz
import google.generativeai as genai
from fastapi import UploadFile

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('models/gemini-2.5-flash')

async def process_resume_analysis(file: UploadFile):
    pdf_content = await file.read()
    
    text = ""
    with fitz.open(stream=pdf_content, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()

    if not text.strip():
        return "Could not extract text from this document."

    prompt = f"""
    You are an AI Interviewer preparing for a call. Analyze this resume:
    
    {text}
    
    Provide a concise candidate briefing:
    - Experience Level & Primary Role
    - Top Technical Skills
    - 2-3 Notable Projects/Achievements
    - Suggested 'deep-dive' topics for this interview
    """

    response = model.generate_content(prompt)
    return response.text