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
    access_token = None

    def force_login(self, user: User):
        access_token = generate_user_access_token(user)
        self.access_token = access_token
        self.headers['Authorization'] = f'{access_token.token_type} {access_token.token}'

    def logout(self):
        self.access_token = None
        self.headers.pop('Authorization', None)


class ApiTestCase(BaseTestCase):
    client: ApiTestClient

    def setUp(self):
        super().setUp()
        self.user = UserFactory()
        self.client = ApiTestClient(app)