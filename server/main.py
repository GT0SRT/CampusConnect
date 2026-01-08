from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
from gemini_client import process_image_with_gemini

app = FastAPI()

class ImageRequest(BaseModel):
    # Base64 string
    image: str
    instruction: str = "professional"

@app.post("/generate")
async def generate_endpoint(request: ImageRequest):
    try:
        if not request.image:
            raise HTTPException(status_code=400, detail="Image string is missing")

        # Call the simplified function
        result = process_image_with_gemini(
            base64_string=request.image, 
            instruction=request.instruction
        )

        return {
            "status": "success",
            "style_used": request.instruction,
            "response": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)