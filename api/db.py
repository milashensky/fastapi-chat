from contextlib import contextmanager
from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from sqlmodel import create_engine, Session

from conf import settings


def get_db_connection_dsn():
    return f'{settings.db_engine}://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{settings.db_name}'


@lru_cache
def get_engine():
    engine = create_engine(
        get_db_connection_dsn(),
        poolclass=settings.db_pool_class,
    )
    return engine


@lru_cache
def session_factory():
    return Session(get_engine())


@contextmanager
def get_session():
    with Session(get_engine()) as session:
        yield session


def get_dep_session():
    with Session(get_engine()) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_dep_session)]
