import datetime
import enum
from typing import TYPE_CHECKING, Optional
import uuid
from sqlalchemy import Column, DateTime, func
from sqlmodel import Enum, Field, SQLModel, Relationship, UniqueConstraint

from conf import settings

if TYPE_CHECKING:
    from auth.models import User


class ChatRoom(SQLModel, table=True):
    __tablename__ = 'chat_room'

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    created_at: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow,
    )
    updated_at: Optional[datetime.datetime] = Field(
        default=None,
        sa_column=Column(DateTime(), onupdate=func.now()),
    )
    created_by_id: int | None = Field(
        default=None,
        foreign_key='auth_users.id',
        ondelete="SET NULL",
    )
    messages: list['Message'] = Relationship(
        back_populates='chat_room',
        cascade_delete=True,
    )
    roles: list['RoomRole'] = Relationship(
        back_populates='chat_room',
        cascade_delete=True,
    )
    invites: list['RoomInvite'] = Relationship(
        back_populates='chat_room',
        cascade_delete=True,
    )


class MessageTypeEnum(enum.Enum):
    TEXT = 'text'
    SYSTEM_ANNOUNCEMENT = 'system_announcement'


class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    content: str
    type: MessageTypeEnum = Field(
        default=MessageTypeEnum.TEXT,
        sa_column=Column(Enum(MessageTypeEnum)),
    )
    created_by_id: int | None = Field(
        index=True,
        default=None,
        foreign_key='auth_users.id',
        ondelete="SET NULL",
    )
    created_at: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow,
    )
    updated_at: Optional[datetime.datetime] = Field(
        default=None,
        sa_column=Column(DateTime(), onupdate=func.now()),
    )
    chat_room_id: int | None = Field(
        default=None,
        foreign_key='chat_room.id',
        ondelete="CASCADE",
    )
    chat_room: ChatRoom = Relationship(back_populates='messages')


class RoomRoleEnum(str, enum.Enum):
    ADMIN = 'admin'
    MODERATOR = 'mod'
    USER = 'user'


def get_expires_at():
    now = datetime.datetime.now(datetime.timezone.utc)
    return now + datetime.timedelta(hours=settings.chat_invite_valid_hours)


class RoomInvite(SQLModel, table=True):
    __tablename__ = 'chat_room_invite'

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
    )
    created_by_id: int | None = Field(
        default=None,
        foreign_key='auth_users.id',
        ondelete="SET NULL",
    )
    chat_room_id: int | None = Field(
        default=None,
        foreign_key='chat_room.id',
        ondelete="CASCADE",
    )
    chat_room: ChatRoom = Relationship(back_populates='invites')
    expires_at: datetime.datetime = Field(
        default_factory=get_expires_at,
    )
    created_at: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow,
    )
    updated_at: Optional[datetime.datetime] = Field(
        default=None,
        sa_column=Column(DateTime(), onupdate=func.now()),
    )


class RoomRole(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint('chat_room_id', 'user_id', name='unique_user_in_room'),
    )

    id: int | None = Field(default=None, primary_key=True)
    chat_room_id: int | None = Field(
        default=None,
        foreign_key='chat_room.id',
        ondelete="CASCADE",
    )
    chat_room: ChatRoom = Relationship(back_populates='roles')
    user_id: Optional[int] = Field(
        index=True,
        default=None,
        foreign_key='auth_users.id',
        ondelete="CASCADE",
    )
    user: Optional['User'] = Relationship(back_populates='roles')
    role: RoomRoleEnum = Field(
        default=RoomRoleEnum.USER,
        sa_column=Column(Enum(RoomRoleEnum)),
    )
    created_at: datetime.datetime = Field(
        default_factory=datetime.datetime.utcnow,
    )
    updated_at: Optional[datetime.datetime] = Field(
        default=None,
        sa_column=Column(DateTime(), onupdate=func.now()),
    )
    invite_id: Optional[uuid.UUID] = Field(
        default=None,
        foreign_key='chat_room_invite.id',
        ondelete="SET NULL",
    )
