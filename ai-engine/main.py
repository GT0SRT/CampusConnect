from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
import os
from dotenv import load_dotenv
from gemini_client import process_image_with_gemini, generate_interview_prompt_with_gemini
from interviewer import run_interview_chat
from groq_client import chatbot
from interview_analyzer import analyze_interview_with_gemini
from typing import List, Optional
from gemini_resume import process_resume_analysis
from Assesment import generate_interview_assessment_with_gemini, assess_candidate_response_with_gemini

load_dotenv()
app = FastAPI()

frontend_origins = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
)
allowed_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    image: str
    instruction: str = "concise"

@app.post("/generate")
async def generate_endpoint(request: ImageRequest):
    try:
        if not request.image:
            raise HTTPException(status_code=400, detail="Image input is missing")
        
        result = process_image_with_gemini(
            image_input=request.image, 
            instruction=request.instruction
        )
        return {
            "status": "success",
            "style_used": request.instruction,
            "caption": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatBotRequest(BaseModel):
    message: str


class InterviewerRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    company: str = Field(default="Tech Company")
    role_name: str = Field(default="Software Engineer")
    topics: str | List[str] = Field(default="General")
    resume_summary: str = Field(default="No resume provided")
    interview_duration_sec: int = Field(default=0)
    difficulty: str = Field(default="moderate")
    end_call_prompt_count: int = Field(default=0)
    interview_prompt: str = Field(default="")


class GenerateInterviewPromptRequest(BaseModel):
    company: str = Field(default="Tech Company")
    role_name: str = Field(default="Software Engineer")
    topics: str | List[str] = Field(default="General")
    resume_summary: str = Field(default="No resume provided")
    difficulty: str = Field(default="moderate")


@app.post("/generateIP")
async def generate_interview_prompt_endpoint(request: GenerateInterviewPromptRequest):
    try:
        topics_text = ", ".join(request.topics) if isinstance(request.topics, list) else request.topics
        prompt = generate_interview_prompt_with_gemini(
            company=request.company,
            role_name=request.role_name,
            topics=topics_text,
            resume_summary=request.resume_summary,
            difficulty=request.difficulty,
        )
        return {
            "status": "success",
            "interview_prompt": prompt,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TranscriptItem(BaseModel):
    id: Optional[str | float | int] = None
    speaker: str = Field(default="")
    text: str = Field(default="")

class InterviewAnalysisRequest(BaseModel):
    transcript: List[TranscriptItem] = Field(default_factory=list)
    company: str = Field(default="Tech Company")
    role_name: str = Field(default="Software Engineer")
    topics: str | List[str] = Field(default="General")
    resume_summary: str = Field(default="No resume provided")
    interview_duration_sec: int = Field(default=0)

@app.post("/chat")
async def chatbot_endpoint(request: ChatBotRequest):
    try:
        if not request.message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        reply = chatbot(request.message)
        return {
            "status": "success",
            "reply": reply,
        }
    except Exception as e:
        print(f"Chatbot Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interviewer")
async def interviewer_chat_endpoint(request: InterviewerRequest):
    try:
        if not request.message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        formatted_history = [
            {"role": m.role, "content": m.content} for m in request.history
        ]

        topics_text = ", ".join(request.topics) if isinstance(request.topics, list) else request.topics

        result = run_interview_chat(
            user_input=request.message,
            chat_history=formatted_history,
            company=request.company,
            role_name=request.role_name,
            topics=topics_text,
            resume_summary=request.resume_summary,
            interview_duration_sec=request.interview_duration_sec,
            difficulty=request.difficulty,
            end_call_prompt_count=request.end_call_prompt_count,
            interview_prompt=request.interview_prompt,
        )

        return {
            "status": "success",
            "reply": result.get("reply", ""),
            "allotted_time_sec": result.get("allotted_time_sec", 45),
            "interview_ended": result.get("interview_ended", False),
            "end_call_prompted": result.get("end_call_prompted", False),
            "endCallPromptCount": result.get("end_call_prompt_count", 0),
        }
    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_interview(request: InterviewAnalysisRequest):
    transcript_list = [
        {"speaker": item.speaker, "text": item.text, "id": item.id}
        for item in request.transcript
    ]
    
    topics_text = ", ".join(request.topics) if isinstance(request.topics, list) else request.topics

    result = analyze_interview_with_gemini(
        transcript=transcript_list,
        company=request.company,
        role_name=request.role_name,
        topics=topics_text,
        resume_summary=request.resume_summary,
        interview_duration_sec=request.interview_duration_sec
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return result

@app.post("/resumeanalyzer")
async def analyze_resume(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")
    
    try:
        overview = await process_resume_analysis(file)
        return {"overview": overview}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during analysis.")


class QuestionItem(BaseModel):
    id: int
    question: str
    options: List[str]
    topic: str
    difficulty: Optional[str] = None
    time_allocated_sec: Optional[int] = None

class AssessmentRequest(BaseModel):
    company: str = Field(default="Tech Company")
    role_name: str = Field(default="Software Engineer")
    topics: str | List[str] = Field(default="General")
    difficulty: str = Field(default="moderate")
    noOfQuestions: int = Field(default=5)
    totalTime: int = Field(default=300)

class AssessResponseRequest(BaseModel):
    company: str = Field(default="Tech Company")
    role_name: str = Field(default="Software Engineer")
    topics: str | List[str] = Field(default="General")
    resume_summary: str = Field(default="No resume provided")
    difficulty: str = Field(default="moderate")
    user_responses: List[str]
    questions_asked: List[QuestionItem]

@app.post("/generate_assessment")
async def generate_assessment(request: AssessmentRequest):
    topics_text = ", ".join(request.topics) if isinstance(request.topics, list) else request.topics
    assessment = generate_interview_assessment_with_gemini(
        company=request.company,
        role_name=request.role_name,
        topics=topics_text,
        difficulty=request.difficulty,
        noOfQuestions=request.noOfQuestions,
        totalTime=request.totalTime
    )
    if "error" in assessment:
        raise HTTPException(status_code=500, detail=assessment["error"])
    return assessment

@app.post("/assess_response")
async def assess_response(request: AssessResponseRequest):
    topics_text = ", ".join(request.topics) if isinstance(request.topics, list) else request.topics
    questions_list = [q.model_dump() for q in request.questions_asked]
    
    assessment = assess_candidate_response_with_gemini(
        company=request.company,
        role_name=request.role_name,
        topics=topics_text,
        resume_summary=request.resume_summary,
        difficulty=request.difficulty,
        user_responses=request.user_responses,
        questions_asked=questions_list
    )
    if "error" in assessment:
        raise HTTPException(status_code=500, detail=assessment["error"])
    return assessment

if __name__ == "__main__":
    server_host = os.getenv("SERVER_HOST", "0.0.0.0")
    server_port = int(os.getenv("SERVER_PORT", 8000))
    uvicorn.run(app, host=server_host, port=server_port)