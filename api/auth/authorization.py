from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError

from auth.schemas import AccessToken
from auth.password import verify_password
from auth.models import User
from conf import settings
from db import get_session


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


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> AccessToken:
    to_encode = data.copy()
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    if expires_delta:
        expires_at = datetime.now(timezone.utc) + expires_delta
    else:
        expires_at = datetime.now(timezone.utc) + access_token_expires
    expires_at_encoded = int(expires_at.timestamp())
    to_encode.update({'expires_at': expires_at_encoded})
    encoded_jwt = jwt.encode(
        to_encode,
        key=settings.app_secret,
        algorithm=settings.access_token_hash_algorithm,
    )
    return AccessToken(
        token=encoded_jwt,
        token_type='Bearer',
        expires_at=expires_at_encoded,
    )


def decode_token(token: str):
    payload = jwt.decode(
        token,
        settings.app_secret,
        algorithms=[settings.access_token_hash_algorithm],
    )
    return payload


async def authenticate_token(token: str):
    try:
        payload = decode_token(token)
        expires_at = payload.get('expires_at')
        if not expires_at:
            raise CredentialValidationException('Could not validate token expiry')
        if expires_at < datetime.now(timezone.utc).timestamp():
            raise CredentialValidationException('The token is expired')
        user_id = payload.get('sub')
        if user_id is None:
            raise CredentialValidationException('Could not validate credentials')
    except InvalidTokenError:
        raise CredentialValidationException('Could not validate credentials')
    with get_session() as db_session:
        user = db_session.get(User, user_id)
    if user is None:
        raise CredentialValidationException('Could not validate credentials')
    if not user.is_active:
        raise CredentialValidationException('The token is for inactive user')
    return user


def generate_user_access_token(user: User) -> AccessToken:
    if not isinstance(user, User):
        raise TypeError('Invalid value of user')
    access_token = create_access_token(
        data={'sub': str(user.id)},
    )
    return access_token


def get_current_user(request: Request):
    user = request.scope.get('user')
    if not user or (user.id is None):
        raise HTTPException(status_code=401)
    return user


def get_is_authenticated(request: Request) -> bool:
    user = request.scope.get('user')
    if user and user.id is not None:
        return True
    return False
