from typing import Annotated

from fastapi import Depends, HTTPException
from sqlmodel import select

from auth.authorizers import require_authentication, require_superuser
from auth.authorization import generate_user_access_token, get_is_authenticated
from auth.models import User
from auth.password import hash_password, verify_password
from auth.schemas import CreateUserForm, LoginForm, LoginUserResponse, PublicUser
from db import SessionDep, get_session
from utils.base_view import BaseApi
from utils.exceptions import ValidationError
from utils.response import JsonResponse


def registration_api(
    user_data: CreateUserForm,
    is_authenticated: Annotated[bool, Depends(get_is_authenticated)],
    db_session: SessionDep,
):
    if is_authenticated:
        raise HTTPException(403, 'User is already authenticated')
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


def login_api(
    login_form: LoginForm,
    is_authenticated: Annotated[bool, Depends(get_is_authenticated)],
    db_session: SessionDep,
):
    if is_authenticated:
        raise HTTPException(403, 'User is already logged in')
    query = select(User).where(User.email == login_form.email)
    user = db_session.exec(query).first()
    if not user:
        raise ValidationError({'__all__': ['Incorrect email or password']})
    is_valid = verify_password(login_form.password, user.password)
    if not is_valid:
        raise ValidationError({'__all__': ['Incorrect email or password']})
    return LoginUserResponse(
        user=PublicUser.model_validate(user),
        access_token=generate_user_access_token(user),
    )


class CurrentUserApi(BaseApi):
    authorizers = [require_authentication]

    async def get(self, request):
        return LoginUserResponse(
            user=PublicUser.model_validate(request.user),
            access_token=request.access_token,
        )


class UserApi(BaseApi):
    authorizers = [require_authentication, require_superuser]

    async def get(self, request, user_id):
        with get_session() as db_session:
            user = db_session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail='User not found')
        return PublicUser.model_validate(user)


class AccessTokenApi(BaseApi):
    authorizers = [require_authentication]

    async def get(self, request):
        return request.access_token

    async def post(self, request):
        return generate_user_access_token(request.user)
