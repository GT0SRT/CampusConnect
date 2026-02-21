from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
from groq_client import chatbot
from gemini_client import process_image_with_gemini

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    image: str
    instruction: str = "concise"

class ChatRequest(BaseModel):
    message: str

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

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        if not request.message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        result = chatbot(request.message)
        
        return {
            "status": "success",
            "reply": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    server_host = os.getenv("SERVER_HOST", "0.0.0.0")
    server_port = int(os.getenv("SERVER_PORT", 8000))
    uvicorn.run(app, host=server_host, port=server_port)