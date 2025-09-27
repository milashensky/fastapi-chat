from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from sqlmodel import select

from auth.models import User
from db import get_session


class AccessToken(BaseModel):
    token: str
    token_type: str
    expires_at: int


class CreateUserForm(BaseModel):
    email: EmailStr
    name: Optional[str]
    password: str = Field(min_length=6)

    @field_validator('email')
    @classmethod
    def validate_email(cls, value):
        with get_session() as db_session:
            query = select(User).where(User.email == value)
            existing_user = db_session.exec(query).first()
            if existing_user:
                raise ValueError('Email is already in use.')
        return value


class PublicUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: Optional[str]
    email: str


class LoginUserResponse(BaseModel):
    user: PublicUser
    access_token: AccessToken