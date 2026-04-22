from fastapi import FastAPI
from core.middleware import register_middleware
from db.session import init_db
from routers import chat, video

app = FastAPI(title="ChatMath API")

register_middleware(app)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(chat.router,  prefix="/api",  tags=["Chat"])
app.include_router(video.router, prefix="/api", tags=["Video"])

@app.get("/", tags=["Status"])
def root():
    return {"status": "ChatMath backend is running"}