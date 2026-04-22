from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    ENV: str = "development"
    DATABASE_URL: str
    GEMINI_API_KEY: str
    STORAGE_BACKEND: str = "local" 
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    class Config:
        env_file = f".env.{os.getenv('ENV', 'development')}"

settings = Settings()