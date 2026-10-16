import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "TirtaDesa"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "tirtadesa-secret-key-32-character-length-dev"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    DATABASE_URL: str = "sqlite:///./tirtadesa.db"
    AUTO_SEED: bool = True
    UPLOAD_DIR: str = "./uploads"

    # WhatsApp Notifications (optional)
    WHATSAPP_ENABLED: bool = False
    WHATSAPP_GATEWAY_URL: str = ""
    WHATSAPP_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
