from typing import Annotated

from fastapi import Depends, HTTPException

from auth.authorization import generate_user_access_token, get_is_authenticated
from auth.models import User
from auth.password import hash_password
from auth.schemas import CreateUserForm, LoginUserResponse, PublicUser
from db import get_session
from utils.base_view import BaseView
from utils.response import JsonResponse


def registration_api(
    user_data: CreateUserForm,
    is_authenticated: Annotated[bool, Depends(get_is_authenticated)],
):
    if is_authenticated:
        raise HTTPException(403, 'User is already authenticated')
    with get_session() as db_session:
        user_data.password = hash_password(user_data.password)
        user = User.model_validate(user_data)
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    return JsonResponse(
        content=LoginUserResponse(
            user=PublicUser.model_validate(user),
            access_token=generate_user_access_token(user),
        ),
        status_code=201,
    )


class CurrentUserApi(BaseView):
    async def get(self, request):
        if not request.user:
            raise HTTPException(status_code=401, detail='Not authorized')
        return {
            'id': request.user.id,
        }


class UserApi(BaseView):
    async def get(self, request, user_id):
        with get_session() as db_session:
            user = db_session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail='User not found')
        return user
