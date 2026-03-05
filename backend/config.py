import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv(dotenv_path='backend/.env')


class Settings(BaseSettings):
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "Qx2Ao58y1zgpeCvgBhbND4rwHwB7A8RF")
    DATABASE_PATH: str = "visadoc.db"
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
