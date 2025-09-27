from functools import lru_cache

from dotenv import load_dotenv
from fastapi import FastAPI

from settings import Settings
from auth.middleware import session_user_middleware
from auth.router import auth_router


load_dotenv()


@lru_cache
def get_settings():
    return Settings()


app = FastAPI()

app.add_middleware(session_user_middleware)

app.include_router(auth_router, prefix='/api/auth')