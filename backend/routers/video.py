from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter()

OUTPUTS_DIR = Path(__file__).resolve().parents[2] / "outputs"

print(f"[video router] OUTPUTS_DIR: {OUTPUTS_DIR}")

@router.get("/{filepath:path}")
async def serve_video(filepath: str):
    full_path = OUTPUTS_DIR / filepath
    print(f"[video] full_path: {full_path}")
    print(f"[video] exists: {full_path.is_file()}")
    if not full_path.is_file():
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(str(full_path), media_type="video/mp4")