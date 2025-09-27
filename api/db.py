from contextlib import contextmanager
from functools import lru_cache

from sqlmodel import create_engine, Session



def get_db_connection_dsn():
    from main import get_settings

    settings = get_settings()
    return f'{settings.db_engine}://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_name}'


@lru_cache
def get_engine():
    from main import get_settings

    settings = get_settings()
    engine = create_engine(
        get_db_connection_dsn(),
        poolclass=settings.db_pool_class,
    )
    return engine


def session_factory():
    return Session(get_engine())


@contextmanager
def get_session():
    with Session(get_engine()) as session:
        yield session