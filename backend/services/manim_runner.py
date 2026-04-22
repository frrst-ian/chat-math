import subprocess
import uuid
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
SCRIPTS_DIR = BASE_DIR / "manim_scripts"
OUTPUTS_DIR = BASE_DIR / "outputs"

print(f"[manim_runner] OUTPUTS_DIR: {OUTPUTS_DIR}")

def run_manim_script(script: str) -> str | None:
    SCRIPTS_DIR.mkdir(exist_ok=True)
    OUTPUTS_DIR.mkdir(exist_ok=True)

    script_id = str(uuid.uuid4())[:8]
    script_path = SCRIPTS_DIR / f"scene_{script_id}.py"
    script_path.write_text(script)

    print(f"[manim_runner] running script_id: {script_id}")

    result = subprocess.run(
        ["manim", str(script_path), "Visualization", "-ql", "--media_dir", str(OUTPUTS_DIR), "--disable_caching"],
        capture_output=True,
        text=True,
        timeout=120,
    )

    print(f"[manim_runner] returncode: {result.returncode}")
    print(f"[manim_runner] stdout: {result.stdout[-1000:]}")

    if result.returncode != 0:
        print(f"[manim_runner] stderr: {result.stderr}")
        return None

    for mp4 in OUTPUTS_DIR.rglob("*.mp4"):
        if script_id in str(mp4):
            relative = mp4.relative_to(OUTPUTS_DIR)
            print(f"[manim_runner] found: {relative}")
            return str(relative)

    print("[manim_runner] no mp4 found")
    return None