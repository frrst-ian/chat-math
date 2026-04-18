# ChatMath

LLM-based conversational mathematical visualization system.

## Setup

1. Create and activate virtual environment:
   python -m venv venv
   venv\Scripts\activate

2. Install dependencies:
   pip install -r requirements.txt

3. Add your Gemini API key to backend/.env:
   GEMINI_API_KEY=your_key_here

4. Run the backend:
   cd backend
   uvicorn main:app --reload

5. API will be live at http://localhost:8000
   Docs at http://localhost:8000/docs

## Stack
- FastAPI backend
- Gemini 2.5 Pro (LLM + Manim code generation)
- Manim CE (animation rendering)
- ChromaDB (RAG - Phase 3)
- Supabase PostgreSQL (conversation history - Phase 5)
- React frontend (separate setup)
- Cloudflare R2 (video storage - Phase 4)
