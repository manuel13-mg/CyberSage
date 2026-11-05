from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    frontend_origin: str = "http://127.0.0.1:5173"
    postgres_url: str = ""
    neo4j_url: str = ""
    database_url: str = "sqlite:///./cybersage.db"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
