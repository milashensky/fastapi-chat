from unittest import IsolatedAsyncioTestCase

from fastapi.testclient import TestClient
from starlette.types import ASGIApp

from auth.tests.factories import UserFactory
from auth.models import User
from auth.authorization import generate_user_access_token
from main import app


class BaseTestCase(IsolatedAsyncioTestCase):
    app: ASGIApp

    def setUp(self):
        self.app = app


class ApiTestClient(TestClient):
    def force_login(self, user: User):
        access_token = generate_user_access_token(user)
        self.headers['Authorization'] = f'{access_token.token_type} {access_token.token}'


class ApiTestCase(BaseTestCase):
    client: ApiTestClient

    def setUp(self):
        super().setUp()
        self.user = UserFactory()
        self.client = ApiTestClient(app)