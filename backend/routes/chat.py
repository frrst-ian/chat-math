import os
import uuid
import subprocess
import traceback
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.llm import get_llm_response

router = APIRouter()

MANIM_SCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "..", "manim_scripts")
MEDIA_DIR = os.path.join(os.path.dirname(__file__), "..", "media")

@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        llm_result = get_llm_response(
            message=request.message,
            conversation_id=request.conversation_id
        )
        video_url = None

        if llm_result["manim_script"]:
            script_id = str(uuid.uuid4())
            script_filename = f"scene_{script_id}.py"
            script_path = os.path.abspath(
                os.path.join(MANIM_SCRIPTS_DIR, script_filename)
            )

            os.makedirs(MANIM_SCRIPTS_DIR, exist_ok=True)

            with open(script_path, "w", encoding="utf-8") as f:
                f.write(llm_result["manim_script"])

            result = subprocess.run(
                [
                    "manim",
                    "-ql",
                    "--media_dir", os.path.abspath(MEDIA_DIR),
                    script_path,
                    "Visualization"
                ],
                capture_output=True,
                text=True,
                timeout=360
            )

            if result.returncode != 0:
                raise RuntimeError(f"Manim render failed:\n{result.stderr}")

            output_video = os.path.join(
                MEDIA_DIR, "videos",
                os.path.splitext(script_filename)[0],
                "480p15", "Visualization.mp4"
            )

            if os.path.exists(output_video):
                video_url = output_video

        return ChatResponse(
            reply=llm_result["reply"],
            video_url=video_url,
            conversation_id=request.conversation_id
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))