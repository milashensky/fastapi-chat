from fastapi import HTTPException

from auth.models import User
from db import get_session
from utils.base_view import BaseView


class AuthInfoApi(BaseView):
    async def get(self, request):
        return {
            'success': True,
        }


class CurrentUserApi(BaseView):
    async def get(self, request):
        return {
            'id': 1,
        }


class UserApi(BaseView):
    async def get(self, request, user_id):
        with get_session() as db_session:
            user = db_session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Hero not found")
        return user