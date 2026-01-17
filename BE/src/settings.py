from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_NAME: str
    API_VERSION: str
    API_DESCRIPTION: str
    LOGGING_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    OPENAI_API_KEY: str
    GEMINI_API_KEY: str
    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
