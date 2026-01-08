from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
from gemini_client import process_image_with_gemini

load_dotenv()

app = FastAPI()

# CORS Configuration - Load from environment or use defaults
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    # Accept URL strings OR Base64 strings
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

if __name__ == "__main__":
    server_host = os.getenv("SERVER_HOST", "0.0.0.0")
    server_port = int(os.getenv("SERVER_PORT", 8000))
    uvicorn.run(app, host=server_host, port=server_port)