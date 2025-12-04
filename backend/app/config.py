# backend/app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False
    
    class Config:
        env_file = ".env" if os.path.exists(".env") else None

@lru_cache()
def get_settings():
    return Settings()