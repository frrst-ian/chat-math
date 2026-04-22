from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@router.get("/{filepath:path}")
async def serve_video(filepath: str):
    full_path = os.path.join(BASE_DIR, "media", filepath)
    if not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(full_path, media_type="video/mp4")