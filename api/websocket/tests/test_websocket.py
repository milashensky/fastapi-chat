from starlette.websockets import WebSocketDisconnect

from auth.tests.factories import UserFactory
from chat.tests.base import ChatApiTestCase
from chat.tests.factories import MessageFactory, RoomRoleFactory, RoomInviteFactory
from websocket.manager import manager
from utils.base_tests import ApiTestClient


class WebSocketTestCase(ChatApiTestCase):
    def get_ws_url(self, token=None):
        url = self.app.url_path_for('websocket:connect')
        if token:
            return f'{url}?token={token}'
        return url

    def get_message_url(self):
        return self.app.url_path_for('chat:create_message_api', room_id=self.chat_room.id)

    def test_should_reject_unauthenticated_connection(self):
        with self.assertRaises(WebSocketDisconnect) as context:
            with self.client.websocket_connect(self.get_ws_url()) as websocket:
                websocket.receive_json()
        self.assertEqual(context.exception.code, 4003)

    def test_should_accept_authenticated_connection(self):
        self.client.force_login(self.user)
        token = self.client.access_token.token
        with self.client.websocket_connect(self.get_ws_url(token=token)) as websocket:
            self.assertIn(self.user.id, manager.active_connections)
            websocket.close()

    def test_should_receive_new_message_notification(self):
        self.client.force_login(self.user)
        token = self.client.access_token.token
        with self.client.websocket_connect(self.get_ws_url(token=token)) as websocket:
            self.client.post(
                self.get_message_url(),
                json={'content': 'Hello world'},
            )
            data = websocket.receive_json()
            self.assertEqual(data['type'], 'message_created')
            self.assertEqual(data['content']['content'], 'Hello world')

    def test_should_receive_user_joined_notification(self):
        self.client.force_login(self.user)
        token = self.client.access_token.token
        invite = RoomInviteFactory(chat_room=self.chat_room)
        new_user = UserFactory()
        other_client = ApiTestClient(self.app)
        other_client.force_login(new_user)
        with self.client.websocket_connect(self.get_ws_url(token=token)) as websocket:
            other_client.get(
                self.app.url_path_for('chat:accept_invite_api', invite_id=invite.id),
            )
            data = websocket.receive_json()
            self.assertEqual(data['type'], 'message_created')
            self.assertIn('entered the chat', data['content']['content'])

    def test_should_receive_user_left_notification(self):
        self.client.force_login(self.user)
        token = self.client.access_token.token
        other_role = RoomRoleFactory(chat_room=self.chat_room)
        other_client = ApiTestClient(self.app)
        other_client.force_login(other_role.user)
        with self.client.websocket_connect(self.get_ws_url(token=token)) as websocket:
            other_client.delete(
                self.app.url_path_for('chat:delete_room_role_api', role_id=other_role.id),
            )
            data = websocket.receive_json()
            self.assertEqual(data['type'], 'message_created')
            self.assertIn('left the chat', data['content']['content'])

    def test_should_receive_message_updated_notification(self):
        self.client.force_login(self.user)
        token = self.client.access_token.token
        message = MessageFactory(
            chat_room=self.chat_room,
            created_by=self.user,
        )
        with self.client.websocket_connect(self.get_ws_url(token=token)) as websocket:
            self.client.patch(
                self.app.url_path_for('chat:update_message_api', message_id=message.id),
                json={'content': 'Updated content'},
            )
            data = websocket.receive_json()
            self.assertEqual(data['type'], 'message_updated')
            self.assertEqual(data['content']['id'], message.id)
            self.assertEqual(data['content']['content'], 'Updated content')

    def test_should_receive_message_deleted_notification(self):
        self.client.force_login(self.user)
        token = self.client.access_token.token
        message = MessageFactory(
            chat_room=self.chat_room,
            created_by=self.user,
        )
        message_id = message.id
        with self.client.websocket_connect(self.get_ws_url(token=token)) as websocket:
            self.client.delete(
                self.app.url_path_for('chat:delete_message_api', message_id=message_id),
            )
            data = websocket.receive_json()
            self.assertEqual(data['type'], 'message_deleted')
            self.assertEqual(data['content']['id'], message_id)
