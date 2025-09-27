from freezegun import freeze_time
from sqlmodel import select

from auth.authorization import generate_user_access_token
from auth.models import User
from auth.password import verify_password
from db import get_session
from utils.test_matchers import StringContaining
from utils.base_tests import ApiTestCase


class RegistrationApiTestCase(ApiTestCase):
    @property
    def url(self):
        return self.app.url_path_for('auth:registration_api')

    async def test_authorized(self):
        self.client.force_login(self.user)
        with self.subTest('should return 403 if already authorized'):
            response = self.client.post(self.url, json={
                'email': 'somebody@email.com',
                'name': 'shrek',
                'password': 'somebody12345',
            })
            self.assertEqual(response.status_code, 403)

    async def test_post(self):
        with self.subTest('should validate email'):
            response = self.client.post(self.url, json={
                'email': 'testemail.com',
                'name': 'somebody',
                'password': 'somebody_once_told_me',
            })
            self.assertEqual(response.status_code, 400)
            self.assertDictEqual(
                response.json(),
                {
                    'email': [StringContaining('not a valid email address')],
                },
            )
        with self.subTest('should validate email required'):
            response = self.client.post(self.url, json={
                'name': 'somebody',
                'password': 'somebody_once_told_me',
            })
            self.assertEqual(response.status_code, 400)
            self.assertDictEqual(
                response.json(),
                {
                    'email': ['Field required'],
                },
            )
        with self.subTest('should validate email is available'):
            response = self.client.post(self.url, json={
                'email': self.user.email,
                'name': 'somebody',
                'password': 'somebody_once_told_me',
            })
            self.assertEqual(response.status_code, 400)
            self.assertDictEqual(
                response.json(),
                {
                    'email': ['Email is already in use.'],
                },
            )
        with self.subTest('should validate password'):
            response = self.client.post(self.url, json={
                'email': 'somebody@email.com',
                'name': 'shrek',
            })
            self.assertEqual(response.status_code, 400)
            self.assertDictEqual(
                response.json(),
                {
                    'password': ['Field required'],
                },
            )
        with self.subTest('should validate password length'):
            response = self.client.post(self.url, json={
                'email': 'somebody@email.com',
                'name': 'shrek',
                'password': '12345',
            })
            self.assertEqual(response.status_code, 400)
            self.assertDictEqual(
                response.json(),
                {
                    'password': ['String should have at least 6 characters'],
                },
            )
        with (
            self.subTest('should create user and return token info'),
            freeze_time('2025-10-10T12:30:00Z'),
        ):
            data = {
                'email': 'somebody@email.com',
                'name': 'shrek',
                'password': 'somebody12345',
            }
            response = self.client.post(self.url, json=data)
            self.assertEqual(response.status_code, 201)
            response_data = response.json()
            with get_session() as db_session:
                query = select(User).where(User.email == data['email'])
                user = db_session.exec(query).first()
            self.assertEqual(user.email, data['email'])
            self.assertEqual(user.name, data['name'])
            self.assertTrue(verify_password(data['password'], user.password))
            self.assertEqual(response_data['user'], {
                'id': user.id,
                'name': user.name,
                'email': user.email,
            })
            access_token = generate_user_access_token(user)
            self.assertEqual(response_data['access_token'], {
                'token': access_token.token,
                'token_type': access_token.token_type,
                'expires_at': access_token.expires_at,
            })