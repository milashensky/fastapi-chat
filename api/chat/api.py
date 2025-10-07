import datetime
from typing import Annotated, List
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select

from auth.authorization import get_current_user
from chat.models import ChatRoom, RoomInvite, RoomRole, RoomRoleEnum
from chat.schemas import ChatRoomUpdate, CreateRoomBody, PublicChatInvite, PublicChatRoom
from conf import settings
from db import SessionDep


chat_router = APIRouter()


def get_user_chat_rooms(
    current_user: Annotated[list, Depends(get_current_user)],
    db_session: SessionDep,
):
    statement = select(ChatRoom).join(RoomRole).where(RoomRole.user_id == current_user.id)
    chat_rooms = db_session.exec(statement).scalars().all()
    return chat_rooms


@chat_router.get('/rooms', name='chat:rooms_list_api', response_model=List[PublicChatRoom])
async def chat_room_list_api(rooms: Annotated[list, Depends(get_user_chat_rooms)]):
    return rooms


@chat_router.post('/rooms', name='chat:create_room_api', response_model=PublicChatRoom, status_code=201)
async def create_chat_room_api(
    room_data: CreateRoomBody,
    current_user: Annotated[list, Depends(get_current_user)],
    db_session: SessionDep,
):
    new_room = ChatRoom.model_validate(room_data)
    new_room.created_by_id = current_user.id
    db_session.add(new_room)
    new_role = RoomRole(
        user=current_user,
        chat_room=new_room,
        role=RoomRoleEnum.ADMIN,
    )
    db_session.add(new_role)
    db_session.commit()
    db_session.refresh(new_room)
    return new_room


def get_user_chat_room(
    room_id: int,
    current_user: Annotated[list, Depends(get_current_user)],
    db_session: SessionDep,
):
    statement = (
        select(ChatRoom)
        .join(RoomRole)
        .where(
            RoomRole.user_id == current_user.id,
            ChatRoom.id == room_id,
        )
    )
    chat_room = db_session.exec(statement).scalar_one_or_none()
    if not chat_room:
        raise HTTPException(404, 'Not Found')
    return chat_room


@chat_router.get('/rooms/{room_id}', name='chat:get_room_api', response_model=PublicChatRoom)
async def get_chat_room_api(
    room: Annotated[ChatRoom, Depends(get_user_chat_room)],
):
    return room


def get_user_chat_room_with_access(
    allow_for_roles=None,
):
    def handler(
        room_id: int,
        current_user: Annotated[list, Depends(get_current_user)],
        db_session: SessionDep,
    ):
        role_query = (
            select(RoomRole)
            .where(
                RoomRole.user_id == current_user.id,
                RoomRole.chat_room_id == room_id,
            )
        )
        room_role = db_session.exec(role_query).scalar_one_or_none()
        if not room_role:
            raise HTTPException(404, 'Not Found')
        # allow access if not set
        if not allow_for_roles:
            return room_role.chat_room
        if room_role.role not in allow_for_roles:
            raise HTTPException(403, 'Not enough permissions to perform the action')
        return room_role.chat_room
    return handler


@chat_router.patch('/rooms/{room_id}', name='chat:delete_room_api', response_model=PublicChatRoom)
async def update_chat_room_api(
    data: ChatRoomUpdate,
    room: Annotated[ChatRoom, Depends(get_user_chat_room_with_access(allow_for_roles=[RoomRoleEnum.MODERATOR, RoomRoleEnum.ADMIN]))],
    db_session: SessionDep,
):
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(room, key, value)
    db_session.add(room)
    db_session.commit()
    db_session.refresh(room)
    return room



@chat_router.delete('/rooms/{room_id}', name='chat:delete_room_api', response_model=None, status_code=204)
async def delete_chat_room_api(
    room: Annotated[ChatRoom, Depends(get_user_chat_room_with_access([RoomRoleEnum.ADMIN]))],
    db_session: SessionDep,
):
    db_session.delete(room)
    db_session.commit()
    return None


@chat_router.post('/rooms/{room_id}/invite', name='chat:create_invite_api', response_model=PublicChatInvite, status_code=200)
async def create_invite_api(
    current_user: Annotated[list, Depends(get_current_user)],
    room: Annotated[ChatRoom, Depends(get_user_chat_room_with_access([RoomRoleEnum.ADMIN, RoomRoleEnum.MODERATOR]))],
    db_session: SessionDep,
):
    now = datetime.datetime.now(datetime.timezone.utc)
    max_expiry = now + datetime.timedelta(minutes=settings.max_invite_reuse_before_expiry_min)
    valid_invite_query = select(RoomInvite).where(
        RoomInvite.chat_room_id == room.id,
        RoomInvite.expires_at > max_expiry,
    )
    valid_invite = db_session.exec(valid_invite_query).scalar_one_or_none()
    if valid_invite:
        return valid_invite
    new_invite = RoomInvite(
        created_by_id=current_user.id,
        chat_room_id=room.id,
    )
    db_session.add(new_invite)
    db_session.commit()
    return new_invite


@chat_router.get('/room-invite/{invite_id}', name='chat:accept_invite_api', response_model=PublicChatRoom, status_code=201)
async def accept_invite_api(
    invite_id: uuid.UUID,
    current_user: Annotated[list, Depends(get_current_user)],
    db_session: SessionDep,
):
    now = datetime.datetime.now()
    invite_query = select(RoomInvite).where(
        RoomInvite.id == invite_id,
    )
    invite = db_session.exec(invite_query).scalar_one_or_none()
    if not invite:
        raise HTTPException(404, 'Not Found')
    if invite.expires_at < now:
        raise HTTPException(410, 'Invite is expired')
    chat_room = invite.chat_room
    role_query = (
        select(RoomRole)
        .where(
            RoomRole.user_id == current_user.id,
            RoomRole.chat_room_id == chat_room.id,
        )
    )
    room_role = db_session.exec(role_query).scalar_one_or_none()
    if room_role:
        raise HTTPException(412, 'Already in the room')
    new_role = RoomInvite(
        created_by_id=current_user.id,
        chat_room_id=chat_room.id,
        invite_id=invite_id,
    )
    db_session.add(new_role)
    db_session.commit()
    db_session.refresh(chat_room)
    return chat_room
