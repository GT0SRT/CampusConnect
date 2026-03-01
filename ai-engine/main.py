from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn
import os
import logging
import uuid
from datetime import datetime
from dotenv import load_dotenv
from gemini_client import process_image_with_gemini, generate_interview_prompt_with_gemini
from interviewer import run_interview_chat
from groq_client import chatbot, filter_fields_generator
from interview_analyzer import analyze_interview_with_gemini
from typing import List, Optional
from gemini_resume import process_resume_analysis
from Assesment import generate_interview_assessment_with_gemini, assess_candidate_response_with_gemini

load_dotenv()
app = FastAPI()
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

required_env_vars = ["GEMINI_API_KEY", "GROQ_API_KEY"]
missing_env_vars = [name for name in required_env_vars if not os.getenv(name)]
if missing_env_vars:
    logger.warning("Missing env vars: %s", ", ".join(missing_env_vars))

service_api_key = os.getenv("AI_ENGINE_API_KEY", "").strip()

frontend_origins = (
    os.getenv("FRONTEND_ORIGINS")
    or os.getenv("CORS_ORIGINS")
    or "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,https://c2net.vercel.app"
)
allowed_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def attach_request_id_and_optional_auth(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    public_paths = {"/", "/health"}

    if service_api_key and request.url.path not in public_paths:
        provided_api_key = request.headers.get("x-api-key", "")
        if provided_api_key != service_api_key:
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    return response


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ai-engine",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "ai-engine",
        "message": "AI engine is running",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s: %s", request.url.path, exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

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
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/generate failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatBotRequest(BaseModel):
    message: str


class MatchmakerFilterRequest(BaseModel):
    prompt: str


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
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/generateIP failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")

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
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/chat failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/matchmaker-filters")
async def matchmaker_filters_endpoint(request: MatchmakerFilterRequest):
    try:
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")

        filters = filter_fields_generator(request.prompt)
        return {
            "status": "success",
            "filters": filters,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/matchmaker-filters failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")

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
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/interviewer failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/analyze")
async def analyze_interview(request: InterviewAnalysisRequest):
    try:
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
            logger.error("/analyze provider error: %s", result["error"])
            raise HTTPException(status_code=500, detail="Internal server error")

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/analyze failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/resumeanalyzer")
async def analyze_resume(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")
    
    try:
        overview = await process_resume_analysis(file)
        return {"overview": overview}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/resumeanalyzer failed: %s", e)
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
    try:
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
            logger.error("/generate_assessment provider error: %s", assessment["error"])
            raise HTTPException(status_code=500, detail="Internal server error")
        return assessment
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/generate_assessment failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/assess_response")
async def assess_response(request: AssessResponseRequest):
    try:
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
            logger.error("/assess_response provider error: %s", assessment["error"])
            raise HTTPException(status_code=500, detail="Internal server error")
        return assessment
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("/assess_response failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    server_host = os.getenv("SERVER_HOST", "0.0.0.0")
    server_port = int(os.getenv("SERVER_PORT", 8000))
    uvicorn.run(app, host=server_host, port=server_port)