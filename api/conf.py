import importlib
import os
from functools import lru_cache

from settings import Settings


@lru_cache
def get_settings() -> Settings:
    settings_module_name = os.getenv('FASTAPI_SETTINGS_MODULE', 'settings')
    settings_module = importlib.import_module(settings_module_name)
    return settings_module.Settings()


class LazySettings:
    def __getattribute__(self, name):
        settings_module = get_settings()
        return getattr(settings_module, name)


settings: Settings = LazySettings()