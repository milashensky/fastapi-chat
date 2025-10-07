from unittest.mock import ANY
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


class CurrentUserTestCase(ApiTestCase):
    @property
    def url(self):
        return self.app.url_path_for('auth:current_user_api')

    def test_get(self):
        with self.subTest('should fail if not logged in'):
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, 401)
        self.client.force_login(self.user)
        with self.subTest('should return info about current user and token'):
            response = self.client.get(self.url)
            response_data = response.json()
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response_data['user'], {
                'id': self.user.id,
                'name': self.user.name,
                'email': self.user.email,
            })
            self.assertEqual(response_data['access_token'], {
                'token': self.client.access_token.token,
                'token_type': self.client.access_token.token_type,
                'expires_at': self.client.access_token.expires_at,
            })


class LoginViewTestCase(ApiTestCase):
    @property
    def url(self):
        return self.app.url_path_for('auth:login_api')

    def test_post(self):
        password = 'correct_password_123'
        self.user.set_password(password)
        self.client.force_login(self.user)
        with self.subTest('should fail if logged in'):
            response = self.client.post(self.url, json={
                'email': self.user.email,
                'password': password,
            })
            self.assertEqual(response.status_code, 403)
        self.client.logout()
        with self.subTest('should fail if no email'):
            response = self.client.post(self.url, json={
                'password': 'Qwe123!@',
            })
            self.assertEqual(response.status_code, 400)
            self.assertDictEqual(
                response.json(),
                {
                    'email': ['Field required'],
                },
            )
        with self.subTest('should fail if no password'):
            response = self.client.post(self.url, json={
                'email': self.user.email,
            })
            self.assertEqual(response.status_code, 400)
            self.assertDictEqual(
                response.json(),
                {
                    'password': ['Field required'],
                },
            )
        with self.subTest('should fail if incorrect email'):
            response = self.client.post(self.url, json={
                'email': 'incorrect-email@email.com',
                'password': password,
            })
            self.assertEqual(response.status_code, 400)
            self.assertDictEqual(
                response.json(),
                {
                    '__all__': ['Incorrect email or password'],
                },
            )
        with self.subTest('should fail if incorrect password'):
            response = self.client.post(self.url, json={
                'email': self.user.email,
                'password': 'incorrect_password',
            })
            self.assertEqual(response.status_code, 400)
            self.assertDictEqual(
                response.json(),
                {
                    '__all__': ['Incorrect email or password'],
                },
            )
        with self.subTest('should return user and token if password and email correct'):
            response = self.client.post(self.url, json={
                'email': self.user.email,
                'password': password,
            })
            self.assertEqual(response.status_code, 200)
            response_data = response.json()
            self.assertEqual(response_data['user'], {
                'id': self.user.id,
                'name': self.user.name,
                'email': self.user.email,
            })
            self.assertEqual(response_data['access_token'], {
                'token': ANY,
                'token_type': 'Bearer',
                'expires_at': ANY,
            })


class AccessTokenApiTestCase(ApiTestCase):
    @property
    def url(self):
        return self.app.url_path_for('auth:access_token_api')

    def test_get(self):
        with self.subTest('should fail if not logged in'):
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, 401)
        with freeze_time('2025-10-10T12:00:00Z'):
            self.client.force_login(self.user)
        with (
            self.subTest('should return current token'),
            freeze_time('2025-10-10T12:20:00Z'),
        ):
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, 200)
            self.assertDictEqual(
                response.json(),
                {
                    'token': self.client.access_token.token,
                    'token_type': 'Bearer',
                    'expires_at': self.client.access_token.expires_at,
                },
            )

    def test_post(self):
        with self.subTest('should fail if not logged in'):
            response = self.client.post(self.url)
            self.assertEqual(response.status_code, 401)
        with freeze_time('2025-10-10T12:00:00Z'):
            self.client.force_login(self.user)
        with (
            self.subTest('should return refreshed token'),
            freeze_time('2025-10-10T12:20:00Z'),
        ):
            response = self.client.post(self.url)
            self.assertEqual(response.status_code, 200)
            response_data = response.json()
            self.assertNotEqual(response_data['token'], self.client.access_token.token)
            # now + 30 min
            self.assertEqual(response_data['expires_at'], 1760100600)
