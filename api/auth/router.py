from fastapi import APIRouter

from auth.api import (
    AccessTokenApi,
    registration_api,
    login_api,
    CurrentUserApi,
    UserApi,
)


auth_router = APIRouter()

auth_router.add_api_route('/registration', registration_api, methods=['POST'], name='auth:registration_api')
auth_router.add_api_route('/login', login_api, methods=['POST'], name='auth:login_api')
auth_router.add_api_route('/token', AccessTokenApi.as_view(), methods=['GET', 'POST'], name='auth:access_token_api')
auth_router.add_api_route('/me', CurrentUserApi.as_view(), methods=['GET', 'PUT', 'PATCH'], name='auth:current_user_api')
auth_router.add_api_route('/user/{user_id}', UserApi.as_view(), methods=['GET'], name='auth:get_user')