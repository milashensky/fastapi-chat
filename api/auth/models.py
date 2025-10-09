from typing import TYPE_CHECKING, List
from pydantic import EmailStr
from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from utils.models import TimestampsMixin

if TYPE_CHECKING:
    from chat.models import RoomRole


class User(TimestampsMixin, SQLModel, table=True):
    __tablename__ = 'auth_users'
    __table_args__ = (UniqueConstraint('email'),)

    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: EmailStr = Field(index=True)
    password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    roles: List['RoomRole'] = Relationship(
        back_populates='user',
        cascade_delete=True,
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
