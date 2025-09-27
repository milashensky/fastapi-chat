from typing import Type
from sqlmodel import StaticPool
from settings import Settings as BaseSettings
from sqlalchemy import Pool


class Settings(BaseSettings):
    db_pool_class: Type[Pool] | None = StaticPool

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.db_name = f'test_{self.db_name}'