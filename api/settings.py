import pathlib
from typing import Type

from pydantic_settings import BaseSettings
from sqlalchemy import Pool


class Settings(BaseSettings):
    app_name: str = 'FastAPI Chat'
    app_secret: str = 'add a strong secret to .env'
    base_dir: str | pathlib.Path = pathlib.Path(__file__).parent.resolve()

    access_token_hash_algorithm: str = 'HS256'
    access_token_expire_minutes: int = 30

    db_engine: str = 'postgresql'
    db_host: str = 'localhost'
    db_port: str = '5432'
    db_user: str = 'add db user to .env'
    db_password: str = 'add db password to .env'
    db_name: str = 'add db name to .env'
    db_pool_class: None | Type[Pool] = None

    class Config:
        env_file = '.env'
