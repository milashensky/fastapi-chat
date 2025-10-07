from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class PublicChatRole(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    chat_room_id: int
    role: str


class PublicChatRoom(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    roles: List[PublicChatRole]


class CreateRoomBody(BaseModel):
    name: str


class ChatRoomUpdate(BaseModel):
    name: Optional[str] = None
