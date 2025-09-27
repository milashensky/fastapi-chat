import datetime
from typing import Optional
from pydantic import EmailStr
from sqlalchemy import Column, DateTime, UniqueConstraint, func
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = 'auth_users'
    __table_args__ = (UniqueConstraint('email'),)

    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: EmailStr = Field(index=True)
    password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    created_at: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow,
    )
    updated_at: Optional[datetime.datetime] = Field(
        default=None,
        sa_column=Column(DateTime(), onupdate=func.now()),
    )

    def __eq__(self, other):
        return (self.id == other.id) and (self.updated_at == other.updated_at)

    def set_password(self, password):
        from auth.password import hash_password
        from db import get_session

        with get_session() as db_session:
            local_object = db_session.merge(self)
            local_object.password = hash_password(password)
            db_session.add(local_object)
            db_session.commit()