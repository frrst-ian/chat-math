from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from routes.chat import router as chat_router
import os

app = FastAPI(title="ChatMath API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ChatMath backend is running"}

@app.get("/video/{filepath:path}")
async def serve_video(filepath: str):
    # filepath will be the relative path under media/
    base = os.path.dirname(os.path.abspath(__file__))
    full_path = os.path.join(base, "media", filepath)
    if not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(full_path, media_type="video/mp4")