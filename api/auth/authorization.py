from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError

from auth.password import verify_password
from auth.models import User
from main import get_settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token', auto_error=False)


class CredentialValidationException(Exception):
    pass


def authenticate_user(email: str, password: str):
    user = User(email=email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    settings = get_settings()
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    if expires_delta:
        expire_at = datetime.now(timezone.utc) + expires_delta
    else:
        expire_at = datetime.now(timezone.utc) + access_token_expires
    to_encode.update({'expiry': expire_at.timestamp()})
    encoded_jwt = jwt.encode(
        to_encode,
        key=settings.app_secret,
        algorithm=settings.access_token_hash_algorithm,
    )
    return encoded_jwt


async def authenticate_token(token: str):
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.app_secret,
            algorithms=[settings.access_token_hash_algorithm],
        )
        expiry = payload.get('expiry')
        if not expiry:
            raise CredentialValidationException('Could not validate token expiry')
        if expiry < datetime.now(timezone.utc).timestamp():
            raise CredentialValidationException('The token is expired')
        user_id = payload.get('sub')
        if user_id is None:
            raise CredentialValidationException('Could not validate credentials')
    except InvalidTokenError:
        raise CredentialValidationException('Could not validate credentials')
    user = User(id=int(user_id))
    if user is None:
        raise CredentialValidationException('Could not validate credentials')
    if not user.is_active:
        raise CredentialValidationException('The token is for inactive user')
    return user


def generate_user_access_token(user: User):
    access_token = create_access_token(
        data={'sub': str(user.id)},
    )
    return access_token


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        user = authenticate_token(token)
    except CredentialValidationException:
        raise HTTPException(status_code=401)
    return user


# @app.post("/token")
# async def login_for_access_token(
#     form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
# ) -> Token:
#     user = authenticate_user(form_data.email, form_data.password)
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect username or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
#     access_token = create_access_token(
#         data={"sub": user.username},
#     )
#     return Token(access_token=access_token, token_type="bearer")


# @app.get("/users/me/", response_model=User)
# async def read_users_me(
#     current_user: Annotated[User, Depends(get_current_active_user)],
# ):
#     return current_user


# @app.get("/users/me/items/")
# async def read_own_items(
#     current_user: Annotated[User, Depends(get_current_active_user)],
# ):
#     return [{"item_id": "Foo", "owner": current_user.username}]
