import os
import json
import re
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn

app = FastAPI()
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)

def _extract_json(text: str) -> dict:
    """Extract JSON from Gemini response, handling markdown code blocks."""
    text = (text or "").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r'```(?:json)?\s*(\{[\s\S]*\})\s*```', text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return {}



def generate_interview_assessment_with_gemini(
    *, company: str, role_name: str, topics: str, difficulty: str, noOfQuestions: int, totalTime: int,
) -> dict:
    safe_company = (company or "Campus Connect").strip()
    safe_role = (role_name or "Software Engineer").strip()
    safe_topics = (topics or "General").strip()
    safe_difficulty = (difficulty or "moderate").strip().lower()
    if safe_difficulty not in {"basic", "moderate", "tough"}:
        safe_difficulty = "moderate"
    
    num_questions = max(1, int(noOfQuestions or 5))
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are an expert technical interviewer creating an assessment for {safe_role} role at {safe_company}.

    REQUIREMENTS:
    - Generate exactly {num_questions} multiple-choice questions (MCQs).
    - Cover these topics: {safe_topics}
    - Difficulty level: {safe_difficulty}
    - Each question should have exactly 4 options.

    OUTPUT FORMAT (STRICT JSON ONLY):
    {{
        "questions": [
            {{
                "id": 1,
                "question": "Clear, concise question text here",
                "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
                "topic": "Specific topic covered by this question",
                "difficulty": "{safe_difficulty}"
            }}
        ],
        "total_questions": {num_questions},
        "total_time_sec": {totalTime}
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                response_mime_type="application/json",
            )
        )
        assessment = _extract_json(response.text)
        if not assessment.get("questions"):
            raise ValueError("Invalid response structure")
        return assessment
        
    except Exception as e:
        print(f"Assessment generation error: {e}")
        return {"error": str(e)}


def assess_candidate_response_with_gemini(
    *, company: str, role_name: str, topics: str, resume_summary: str, difficulty: str, user_responses: list, questions_asked: list
) -> dict:
    safe_company = (company or "Campus Connect").strip()
    safe_role = (role_name or "Software Engineer").strip()
    safe_topics = (topics or "General").strip()
    safe_resume = (resume_summary or "No resume provided").strip()
    safe_difficulty = (difficulty or "moderate").strip().lower()
    
    if not user_responses or not questions_asked:
        return {"error": "Missing user responses or questions"}
    
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    You are an expert technical interviewer assessing a candidate for {safe_role} at {safe_company}.

    CONTEXT:
    - Resume: {safe_resume}
    - Topics: {safe_topics}

    DATA TO EVALUATE:
    - Questions Asked (with options): {json.dumps(questions_asked)}
    - Candidate's Answers: {json.dumps(user_responses)}

    TASK:
    1. For each question, determine the mathematically or factually correct answer from the provided options.
    2. Compare the candidate's answer to your determined correct answer.
    3. Generate a comprehensive performance report.

    OUTPUT FORMAT (STRICT JSON ONLY):
    {{
        "overall_score": 85,
        "correct_answers": 4,
        "total_questions": {len(questions_asked)},
        "detailed_analysis": [
            {{
                "question": "...",
                "candidate_answer": "...",
                "correct_answer": "The answer you determined is correct",
                "is_correct": true,
                "solution": "Brief explanation of why the correct answer is right"
            }}
        ],
        "metrics": {{
            "technical_knowledge": 90,
            "accuracy": 80
        }},
        "topics_covered": ["topic1", "topic2"],
        "strengths": ["Actionable strength"],
        "improvements": ["Specific area to improve"],
        "feedback": "Direct, encouraging coaching feedback addressing the candidate as 'You'."
    }}
    """

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                response_mime_type="application/json",
            )
        )
        assessment = _extract_json(response.text)
        if "overall_score" not in assessment:
            raise ValueError("Invalid assessment structure")
        return assessment
        
    except Exception as e:
        print(f"Response assessment error: {e}")
        return {"error": str(e)}