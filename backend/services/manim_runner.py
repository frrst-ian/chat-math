import subprocess
import os
import uuid

SCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "../../manim_scripts")
OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), "../../outputs")

def run_manim_script(script: str) -> str | None:
    script_id = str(uuid.uuid4())[:8]
    script_path = os.path.join(SCRIPTS_DIR, f"scene_{script_id}.py")

    with open(script_path, "w") as f:
        f.write(script)

    result = subprocess.run(
        [
            "manim", script_path, "Visualization",
            "-ql",          # low quality = 480p, change to -qm for 720p
            "--media_dir", OUTPUTS_DIR,
            "--disable_caching"
        ],
        capture_output=True,
        text=True,
        timeout=60
    )

    if result.returncode != 0:
        print("Manim error:", result.stderr)
        return None

    # find the output video
    for root, dirs, files in os.walk(OUTPUTS_DIR):
        for file in files:
            if file.endswith(".mp4") and script_id in root:
                return os.path.join(root, file)

    return None
