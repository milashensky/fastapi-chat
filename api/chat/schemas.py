import datetime
from typing import List, Optional
import uuid
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
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
    role: RoomRoleEnum


class PublicChatRoom(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    roles: List[PublicRoomRole]


class CreateRoomBody(BaseModel):
    name: str = Field()

    @field_validator('name')
    @classmethod
    def validate_name(cls, name):
        """validates max and min length. not min(max)_length for custom errors and partial support
        """
        if name is None:
            return name
        if len(name) < 3:
            raise ValueError('Must be at least 3 characters long')
        if len(name) > 127:
            raise ValueError('Max length 127 characters long')
        return name


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
