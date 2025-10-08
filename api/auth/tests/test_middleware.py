from unittest import IsolatedAsyncioTestCase

from fastapi import FastAPI
from fastapi.testclient import TestClient
from freezegun import freeze_time

from auth.authorization import generate_user_access_token
from auth.tests.factories import UserFactory
from auth.middleware import SessionUserMiddleware
from utils.request import Request


class SessionMiddlewareTestCase(IsolatedAsyncioTestCase):
    def setUp(self):
        self.user = UserFactory()
        app = FastAPI()
        app.add_middleware(SessionUserMiddleware)

        @app.get('/')
        def test_view(request: Request):
            if not request.user:
                return None
            return request.user.id

        self.client = TestClient(app)

    async def request(self, user=None, token=None):
        if not token and user:
            token = generate_user_access_token(user).token
        headers = {
            'Authorization': f'Bearer {token}'
        }
        return self.client.get(
            '/',
            headers=headers,
        )

    async def test_authenticated(self):
        with self.subTest('should get user by session token from request headers'):
            response = await self.request(self.user)
            response_user_id = response.json()
            self.assertEqual(response_user_id, self.user.id)

    async def test_non_authenticated(self):
        with self.subTest('should assign unauthorized user if no session token in request headers'):
            response = await self.request()
            response_user_id = response.json()
            self.assertIsNone(response_user_id)
        with freeze_time('2025-10-10T12:00:00Z'):
            token = generate_user_access_token(self.user)
        with (
            self.subTest('should assign unauthorized user if session token in request headers is expired'),
            freeze_time('2025-12-10T12:00:00Z'),
        ):
            response = await self.request(token=token.token)
            response_user_id = response.json()
            self.assertIsNone(response_user_id)
        with self.subTest('should assign unauthorized user if session token in request headers is invalid'):
            response = await self.request(token='123456')
            response_user_id = response.json()
            self.assertIsNone(response_user_id)
        with self.subTest('should assign unauthorized user if no user matches session token'):
            user = UserFactory.build()
            user.id = 99999
            token = generate_user_access_token(user)
            response = await self.request(token=token.token)
            response_user_id = response.json()
            self.assertIsNone(response_user_id)
