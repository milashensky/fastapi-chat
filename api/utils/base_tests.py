from unittest import IsolatedAsyncioTestCase

from fastapi.testclient import TestClient

from main import app


class BaseTestCase(IsolatedAsyncioTestCase):
    def setUp(self):
        self.client = TestClient(app)