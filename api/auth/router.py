from fastapi import APIRouter

from auth.api import (
    AuthInfoApi,
    CurrentUserApi,
    UserApi,
)


auth_router = APIRouter()

auth_router.add_api_route('/info', AuthInfoApi.as_view(), methods=['GET'])
auth_router.add_api_route('/user', CurrentUserApi.as_view(), methods=['GET', 'PUT', 'PATCH'])
auth_router.add_api_route('/user/{user_id}', UserApi.as_view(), methods=['GET'])