import datetime
from typing import List, Optional
import uuid
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)
from pydantic_partial import create_partial_model

from chat.models import RoomRoleEnum


class PublicRoomRole(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    chat_room_id: int
    role: RoomRoleEnum


class RoomRoleUpdateBody(BaseModel):
    role: Optional[RoomRoleEnum] = None


class PublicChatRoom(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    roles: List[PublicRoomRole]


class CreateRoomBody(BaseModel):
    name: str = Field(min_length=3)


ChatRoomUpdate = create_partial_model(CreateRoomBody)


class PublicChatInvite(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID


class PublicMessage(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    type: str
    chat_room_id: int
    created_by_id: Optional[int]
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime]


class CreateMessageBody(BaseModel):
    content: str = Field(min_length=1)


MessageUpdateBody = create_partial_model(CreateMessageBody)


class MessagesList(BaseModel):
    total: int
    page: int
    page_size: int
    results: List[PublicMessage]
    next: Optional[int]
