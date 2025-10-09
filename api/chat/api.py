from collections import namedtuple
import datetime
from typing import Annotated, List
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import desc, select

from auth.authorization import get_current_user
from auth.models import User
from chat.models import (
    ChatRoom,
    Message,
    MessageTypeEnum,
    RoomInvite,
    RoomRole,
    RoomRoleEnum,
)
from chat.schemas import (
    ChatRoomUpdate,
    CreateMessageBody,
    CreateRoomBody,
    MessageUpdateBody,
    MessagesList,
    PublicChatInvite,
    PublicRoomRole,
    PublicChatRoom,
    PublicMessage,
    RoomRoleUpdateBody,
)
from conf import settings
from db import SessionDep
from utils.pagination import paginate_response, pagination_dep
from utils.utils import get_utc_now


chat_router = APIRouter()


def patch_model(model, data, db_session):
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(model, key, value)
    db_session.add(model)
    db_session.commit()
    db_session.refresh(model)
    return model


def get_user_chat_rooms(
    current_user: Annotated[User, Depends(get_current_user)],
    db_session: SessionDep,
):
    statement = select(ChatRoom).join(RoomRole).where(RoomRole.user_id == current_user.id)
    chat_rooms = db_session.exec(statement).all()
    return chat_rooms


@chat_router.get('/rooms', name='chat:rooms_list_api', response_model=List[PublicChatRoom])
async def chat_room_list_api(rooms: Annotated[list, Depends(get_user_chat_rooms)]):
    return rooms


@chat_router.post('/rooms', name='chat:create_room_api', response_model=PublicChatRoom, status_code=201)
async def create_chat_room_api(
    room_data: CreateRoomBody,
    current_user: Annotated[User, Depends(get_current_user)],
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
    current_user: Annotated[User, Depends(get_current_user)],
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
    chat_room = db_session.exec(statement).first()
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
        current_user: Annotated[User, Depends(get_current_user)],
        db_session: SessionDep,
    ):
        role_query = (
            select(RoomRole)
            .where(
                RoomRole.user_id == current_user.id,
                RoomRole.chat_room_id == room_id,
            )
        )
        room_role = db_session.exec(role_query).first()
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
    return patch_model(room, data, db_session)



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
    current_user: Annotated[User, Depends(get_current_user)],
    room: Annotated[ChatRoom, Depends(get_user_chat_room_with_access([RoomRoleEnum.ADMIN, RoomRoleEnum.MODERATOR]))],
    db_session: SessionDep,
):
    now = datetime.datetime.now(datetime.timezone.utc)
    max_expiry = now + datetime.timedelta(minutes=settings.max_invite_reuse_before_expiry_min)
    valid_invite_query = select(RoomInvite).where(
        RoomInvite.chat_room_id == room.id,
        RoomInvite.expires_at > max_expiry,
    )
    valid_invite = db_session.exec(valid_invite_query).first()
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
    current_user: Annotated[User, Depends(get_current_user)],
    db_session: SessionDep,
):
    now = get_utc_now()
    invite_query = select(RoomInvite).where(
        RoomInvite.id == invite_id,
    )
    invite = db_session.exec(invite_query).first()
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
    room_role = db_session.exec(role_query).first()
    if room_role:
        raise HTTPException(412, 'Already in the room')
    new_role = RoomRole(
        user_id=current_user.id,
        chat_room_id=chat_room.id,
        invite_id=invite_id,
    )
    db_session.add(new_role)
    enter_message = Message(
        chat_room_id=chat_room.id,
        created_by_id=current_user.id,
        type=MessageTypeEnum.SYSTEM_ANNOUNCEMENT,
        content=f'User {current_user.name} entered the chat.',
    )
    db_session.add(enter_message)
    db_session.commit()
    db_session.refresh(chat_room)
    return chat_room


@chat_router.post('/room/{room_id}/message', name='chat:create_message_api', response_model=PublicMessage, status_code=201)
async def create_message_api(
    data: CreateMessageBody,
    current_user: Annotated[User, Depends(get_current_user)],
    room: Annotated[ChatRoom, Depends(get_user_chat_room)],
    db_session: SessionDep,
):
    message = Message(
        chat_room=room,
        created_by_id=current_user.id,
        content=data.content
    )
    db_session.add(message)
    db_session.commit()
    db_session.refresh(message)
    return message


@chat_router.get('/room/{room_id}/message', name='chat:list_messages_api', response_model=MessagesList)
async def list_messages_api(
    pagination: Annotated[dict, Depends(pagination_dep)],
    room: Annotated[ChatRoom, Depends(get_user_chat_room)],
    db_session: SessionDep,
    search: str | None = None,
):
    messages_query = (
        select(Message)
        .where(
            Message.chat_room_id == room.id,
        )
        .order_by(desc(Message.created_at))
    )
    if search:
        messages_query = messages_query.where(
            Message.type == MessageTypeEnum.TEXT,
            Message.content.ilike(f'%{search}%'),
        )
    return paginate_response(
        messages_query,
        pagination=pagination,
        db_session=db_session,
    )


@chat_router.patch('/message/{message_id}', name='chat:update_message_api', response_model=PublicMessage)
async def update_message_api(
    data: MessageUpdateBody,
    current_user: Annotated[User, Depends(get_current_user)],
    message_id,
    db_session: SessionDep,
):
    message = db_session.exec(
        select(Message)
        .where(
            Message.id == message_id,
            Message.created_by_id == current_user.id,
            Message.type == MessageTypeEnum.TEXT,
        )
    ).first()
    if not message:
        raise HTTPException(404, 'Not Found')
    return patch_model(message, data, db_session)


@chat_router.delete('/message/{message_id}', name='chat:delete_message_api', response_model=None, status_code=204)
async def delete_message_api(
    current_user: Annotated[User, Depends(get_current_user)],
    message_id,
    db_session: SessionDep,
):
    message = db_session.exec(
        select(Message)
        .where(
            Message.id == message_id,
            Message.type == MessageTypeEnum.TEXT,
        )
    ).first()
    if not message:
        raise HTTPException(404, 'Not Found')
    if message.created_by_id != current_user.id:
        chat_role = db_session.exec(
            select(RoomRole)
            .where(
                RoomRole.user_id == current_user.id,
                RoomRole.chat_room_id == message.chat_room_id,
                RoomRole.role.in_([RoomRoleEnum.ADMIN, RoomRoleEnum.MODERATOR]),
            )
        ).first()
        if not chat_role:
            raise HTTPException(404, 'Not Found')
    db_session.delete(message)
    db_session.commit()
    return None


RolePair = namedtuple('RolePair', ['room_role', 'current_user_role'])


def get_room_role(
    role_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db_session: SessionDep,
):
    role_query = (
        select(RoomRole)
        .where(
            RoomRole.id == role_id,
        )
    )
    room_role = db_session.exec(role_query).first()
    if not room_role:
        raise HTTPException(404, 'Not Found')
    user_room_role = db_session.exec(
        select(RoomRole)
        .where(
            RoomRole.user_id == current_user.id,
            RoomRole.chat_room_id == room_role.chat_room_id,
        ),
    ).first()
    if not user_room_role:
        raise HTTPException(404, 'Not Found')
    return RolePair(room_role, user_room_role)


@chat_router.get('/room-role/{role_id}', name='chat:get_room_role_api', response_model=PublicRoomRole)
async def get_room_role_api(
    role_pair: Annotated[RolePair, Depends(get_room_role)],
):
    return role_pair.room_role


@chat_router.patch('/room-role/{role_id}', name='chat:update_room_role_api', response_model=PublicRoomRole)
async def update_room_role_api(
    data: RoomRoleUpdateBody,
    role_pair: Annotated[RolePair, Depends(get_room_role)],
    db_session: SessionDep,
):
    if role_pair.current_user_role.role is not RoomRoleEnum.ADMIN:
        raise HTTPException(403, 'Not enough permissions to perform the action')
    return patch_model(role_pair.room_role, data, db_session)


@chat_router.delete('/room-role/{role_id}', name='chat:delete_room_role_api', response_model=None, status_code=204)
async def delete_room_role_api(
    current_user: Annotated[User, Depends(get_current_user)],
    role_pair: Annotated[RolePair, Depends(get_room_role)],
    db_session: SessionDep,
):
    if (
        (role_pair.current_user_role != role_pair.room_role)
        and (role_pair.current_user_role.role not in [RoomRoleEnum.ADMIN, RoomRoleEnum.MODERATOR])
    ):
        raise HTTPException(403, 'Not enough permissions to perform the action')
    db_session.delete(role_pair.room_role)
    exit_message = Message(
        chat_room_id=role_pair.room_role.chat_room_id,
        created_by_id=current_user.id,
        type=MessageTypeEnum.SYSTEM_ANNOUNCEMENT,
        content=f'User {role_pair.room_role.user.name} left the chat.',
    )
    db_session.add(exit_message)
    db_session.commit()
    return None
