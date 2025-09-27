import importlib
import os
from functools import lru_cache

from fastapi import FastAPI

from auth.middleware import SessionUserMiddleware
from auth.router import auth_router
from settings import Settings


@lru_cache
def get_settings() -> Settings:
    settings_module_name = os.getenv('FASTAPI_SETTINGS_MODULE', 'settings')
    settings_module = importlib.import_module(settings_module_name)
    return settings_module.Settings()


app = FastAPI()

app.add_middleware(SessionUserMiddleware)

app.include_router(auth_router, prefix='/api/auth')