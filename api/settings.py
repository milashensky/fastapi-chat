import os
import pathlib

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "FastAPI Chat"
    base_dir: str | pathlib.Path = pathlib.Path(__file__).parent.resolve()

    db_engine: str = os.getenv('DB', 'postgresql')
    db_host: str = os.getenv('DB_HOST', 'localhost')
    db_port: str = os.getenv('DB_PORT', '5432')
    db_user: str = os.getenv('DB_USER', 'add a user')
    db_password: str = os.getenv('DB_PASSWORD', 'add a password')
    db_name: str = os.getenv('DB_NAME', 'add db')