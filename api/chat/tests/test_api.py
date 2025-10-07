from unittest import skip
from unittest.mock import ANY
from freezegun import freeze_time
from sqlmodel import delete, select
from sqlalchemy.orm import selectinload

from auth.tests.factories import UserFactory
from chat.models import (
    ChatRoom,
    Message,
    RoomInvite,
    RoomRole,
    RoomRoleEnum,
)
from chat.tests.base import ChatApiTestCase
from chat.tests.factories import (
    ChatRoomFactory,
    MessageFactory,
    RoomRoleFactory,
    RoomInviteFactory,
)
from utils.test_matchers import AnyOrderedArray


def serialize_role(role):
    return {
        'id': role.id,
        'user_id': role.user_id,
        'chat_room_id': role.chat_room_id,
        'role': role.role,
    }


def serialize_room(room):
    return {
        'id': room.id,
        'name': room.name,
        'roles': [serialize_role(role) for role in room.roles],
    }


class ChatRoomsApiTestCase(ChatApiTestCase):
    def get_url(self, pk=None):
        if pk is None:
            return self.app.url_path_for('chat:rooms_list_api')
        return self.app.url_path_for('chat:get_room_api', room_id=pk)

    def test_list(self):
        url = self.get_url()
        with self.subTest('should require auth'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 401)
        # a room user has no access to
        ChatRoomFactory()
        room2 = RoomRoleFactory(user=self.user).chat_room
        self.client.force_login(self.user)
        with self.subTest('should list rooms a user has some role in'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 200)
            response_data = response.json()
            self.assertCountEqual(
                response_data,
                [
                    serialize_room(self.chat_room),
                    serialize_room(room2),
                ],
            )

    def test_get(self):
        url = self.get_url(pk=self.chat_room.id)
        with self.subTest('should require auth'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 401)
        self.client.force_login(self.user)
        with self.subTest('should return a room'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 200)
            response_data = response.json()
            self.assertCountEqual(
                response_data,
                serialize_room(self.chat_room),
            )
        unauthed_room = ChatRoomFactory()
        url = self.get_url(pk=unauthed_room.id)
        with self.subTest('should require room access'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 404)

    def test_create(self):
        url = self.get_url()
        name = 'somebody once told me'
        data = {
            'name': name,
        }
        with self.subTest('should require auth'):
            response = self.client.post(url, json=data)
            self.assertEqual(response.status_code, 401)
        self.client.force_login(self.user)
        with self.subTest('should require name'):
            response = self.client.post(url, json={})
            self.assertEqual(response.status_code, 400)
            response_data = response.json()
            self.assertDictEqual(
                response_data,
                {
                    'name': ['Field required'],
                },
            )
        with self.subTest('should create a room and add creator as admin'):
            response = self.client.post(url, json=data)
            self.assertEqual(response.status_code, 201)
            query = (
                select(ChatRoom)
                .options(selectinload(ChatRoom.roles))
                .where(
                    ChatRoom.name == name,
                    ChatRoom.created_by_id == self.user.id,
                )
            )
            new_room = self.db_session.exec(query).first()
            self.assertIsNotNone(new_room)
            new_role = new_room.roles[0]
            self.assertEqual(new_role.user_id, self.user.id)
            self.assertEqual(new_role.role, RoomRoleEnum.ADMIN)
            self.assertCountEqual(
                response.json(),
                serialize_room(new_room),
            )

    def test_delete(self):
        role = RoomRoleFactory(user=self.user)
        room = role.chat_room
        url = self.get_url(pk=room.id)
        with self.subTest('should require auth'):
            response = self.client.delete(url)
            self.assertEqual(response.status_code, 401)
        self.client.force_login(self.user)
        with self.subTest('should require admin role to delete'):
            response = self.client.delete(url)
            self.assertEqual(response.status_code, 403)
            with self.subTest('should not allow to mods to delete chat'):
                role.role = RoomRoleEnum.MODERATOR
                self.db_session.add(role)
                self.db_session.commit()
                response = self.client.delete(url)
                self.assertEqual(response.status_code, 403)
        room_id = self.chat_room.id
        MessageFactory(
            chat_room=self.chat_room,
        )
        url = self.get_url(pk=room_id)
        with self.subTest('should delete room, roles and messages'):
            response = self.client.delete(url)
            self.assertEqual(response.status_code, 204)
            room = self.db_session.get(ChatRoom, room_id)
            self.assertIsNone(room)
            messages = self.db_session.exec(select(Message).where(Message.chat_room_id == room_id)).all()
            self.assertEqual(len(messages), 0)
            roles = self.db_session.exec(select(RoomRole).where(RoomRole.chat_room_id == room_id)).all()
            self.assertEqual(len(roles), 0)

    def test_update(self):
        room = RoomRoleFactory(user=self.user).chat_room
        url = self.get_url(pk=room.id)
        body = {
            'name': 'the world is gonna roll me',
        }
        with self.subTest('should require auth'):
            response = self.client.patch(url, json=body)
            self.assertEqual(response.status_code, 401)
        self.client.force_login(self.user)
        with self.subTest('should require admin or mod role'):
            response = self.client.patch(url, json=body)
            self.assertEqual(response.status_code, 403)
        room_id = self.chat_room.id
        url = self.get_url(pk=room_id)
        with self.subTest('should update room'):
            response = self.client.patch(url, json=body)
            response_data = response.json()
            self.assertEqual(response.status_code, 200, response_data)
            self.db_session.refresh(self.chat_room)
            self.assertEqual(self.chat_room.name, body['name'])
            self.assertCountEqual(
                response_data,
                serialize_room(self.chat_room),
            )
        self.room_role.role = RoomRoleEnum.MODERATOR
        self.db_session.add(self.room_role)
        self.db_session.commit()
        self.db_session.refresh(self.room_role)
        with self.subTest('should allow update room to mods'):
            response = self.client.patch(url, json=body)
            response_data = response.json()
            self.assertEqual(response.status_code, 200, response_data)
        new_user = UserFactory()
        created_at = self.chat_room.created_at
        body = {
            'id': -1,
            'created_at': '2024-12-12T12:12:00',
            'roles': [
                {
                    'id': self.room_role.id,
                    'user_id': new_user.id,
                },
                {
                    'user_id': new_user.id,
                    'role': 'admin'
                },
            ],
        }
        with self.subTest('should not update other fields'):
            response = self.client.patch(url, json=body)
            response_data = response.json()
            self.assertEqual(response.status_code, 200, response_data)
            self.db_session.refresh(self.chat_room)
            self.db_session.refresh(self.room_role)
            self.assertEqual(self.chat_room.id, room_id)
            self.assertEqual(self.chat_room.created_at, created_at)
            self.assertEqual(self.room_role.user_id, self.user.id)


def serialize_message(message):
    return {
        'id': message.id,
        'content': message.content,
        'type': message.type.value,
        'chat_room_id': message.chat_room_id,
        'created_by_id': message.created_by_id,
        'created_at': message.created_at.isoformat(),
        'updated_at': ANY,
    }


class MessagesApiTestCase(ChatApiTestCase):
    maxDiff = None

    def get_url(self, pk=None, room_id=None):
        room_id = room_id or self.chat_room.id
        if pk is None:
            return self.app.url_path_for('chat:list_messages_api', room_id=room_id)
        return self.app.url_path_for('chat:update_message_api', message_id=pk)

    def test_list(self):
        url = self.get_url()
        with self.subTest('should require auth'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 401)
        user = UserFactory()
        self.client.force_login(user)
        with self.subTest('should require some room access'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 404)
        self.client.force_login(self.user)
        with freeze_time('2024-12-12T12:30:00'):
            messages1 = MessageFactory.create_batch(
                size=3,
                chat_room=self.chat_room,
                content='ping ping ping pong',
            )
        with freeze_time('2025-01-12T12:30:00'):
            messages2 = MessageFactory.create_batch(
                size=3,
                chat_room=self.chat_room,
            )
        with freeze_time('2025-02-12T12:30:00'):
            messages3 = MessageFactory.create_batch(
                size=3,
                chat_room=self.chat_room,
            )
        messages = messages1 + messages2 + messages3
        with self.subTest('should return room messages'):
            response = self.client.get(url)
            response_data = response.json()
            self.assertEqual(response.status_code, 200, response_data)
            self.assertCountEqual
            self.assertDictEqual(
                response_data,
                {
                    'total': 9,
                    'page': 1,
                    'page_size': ANY,
                    'next': None,
                    # order is important, but to drop factory order
                    # so we test it later
                    'results': AnyOrderedArray([
                        serialize_message(message)
                        for message in messages
                    ]),
                },
            )
        with self.subTest('should support pagination'):
            response = self.client.get(f'{url}?page=2&page_size=3')
            response_data = response.json()
            self.assertEqual(response.status_code, 200, response_data)
            self.assertDictEqual(
                response_data,
                {
                    'total': 9,
                    'page': 2,
                    'page_size': 3,
                    'next': 3,
                    # also tests the order, since second batch is clearly created after first
                    'results': AnyOrderedArray([
                        serialize_message(message)
                        for message in messages2
                    ]),
                },
            )
        with self.subTest('should support search'):
            response = self.client.get(f'{url}?search=ping PonG')
            response_data = response.json()
            self.assertEqual(response.status_code, 200, response_data)
            self.assertDictEqual(
                response_data,
                {
                    'total': 3,
                    'page': 1,
                    'page_size': ANY,
                    'next': None,
                    'results': AnyOrderedArray([
                        serialize_message(message)
                        for message in messages1
                    ]),
                },
            )

    def test_create(self):
        url = self.get_url()
        body = {
            'content': 'somebody once told me',
        }
        with self.subTest('should require auth'):
            response = self.client.post(url, json=body)
            self.assertEqual(response.status_code, 401)
        user = UserFactory()
        self.client.force_login(user)
        with self.subTest('should require some room access'):
            response = self.client.post(url, json=body)
            self.assertEqual(response.status_code, 404)
        self.client.force_login(self.user)
        with self.subTest('should require content'):
            response = self.client.post(url, json={
                'content': '',
            })
            self.assertEqual(response.status_code, 400)
        with self.subTest('should create room message'):
            response = self.client.post(url, json=body)
            self.assertEqual(response.status_code, 201)

    @skip('not implemented')
    def test_update(self):
        with self.subTest('should require auth'):
            self.fail()
        with self.subTest('should only allow to edit message to creator'):
            self.fail()
        with self.subTest('should should edit message content'):
            self.fail()
        with self.subTest('should not edit other fields'):
            self.fail()

    @skip('not implemented')
    def test_delete(self):
        with self.subTest('should require auth'):
            self.fail()
        with self.subTest('should not allow to delete a message without rights'):
            self.fail()
        with self.subTest('should allow delete message to creator'):
            self.fail()
        with self.subTest('should allow delete message to mod'):
            self.fail()
        with self.subTest('should allow delete message to admin'):
            self.fail()


@skip('not implemented')
class RoomRoleApiTestCase(ChatApiTestCase):
    def get_url(self, pk):
        return self.app.url_path_for('chat:update_room_role_api', role_id=pk)

    def test_get(self):
        with self.subTest('should require auth'):
            self.fail()
        with self.subTest('should should require room access'):
            self.fail()
        with self.subTest('should return room role'):
            self.fail()

    def test_update(self):
        with self.subTest('should require auth'):
            self.fail()
        with self.subTest('should should require admin'):
            self.fail()
        with self.subTest('should allow to edit role'):
            self.fail()
        with self.subTest('should not edit other fields'):
            self.fail()

    def test_delete(self):
        with self.subTest('should require auth'):
            self.fail()
        with self.subTest('should not allow to delete a role without rights'):
            self.fail()
        with self.subTest('should allow delete role to owner'):
            self.fail()
        with self.subTest('should allow delete role to mod'):
            self.fail()
        with self.subTest('should allow delete role to admin'):
            self.fail()


class ChatInviteApiTestCase(ChatApiTestCase):
    def get_url(self, pk=None):
        if not pk:
            return self.app.url_path_for('chat:create_invite_api', room_id=self.chat_room.id)
        return self.app.url_path_for('chat:accept_invite_api', invite_id=pk)

    def test_get(self):
        invite = RoomInviteFactory()
        chat_room = invite.chat_room
        url = self.get_url(invite.id)
        with self.subTest('should require auth'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 401)
        self.client.force_login(self.user)
        with self.subTest('should add a user to chat'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 201)
            role = self.db_session.exec(
                select(RoomRole)
                .where(
                    RoomRole.chat_room_id == self.chat_room.id,
                    RoomRole.user_id == self.user.id
                )
            ).first()
            self.assertIsNotNone(role)
            self.assertDictEqual(
                response.json(),
                serialize_room(chat_room),
            )
        invite = RoomInviteFactory(chat_room=self.chat_room)
        url = self.get_url(invite.id)
        with self.subTest('should not add a user already has role'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 412)
        invite = RoomInviteFactory(
            expires_at='2024-12-12T12:30:00',
        )
        url = self.get_url(invite.id)
        with self.subTest('should not work past expiry'):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 410)

    def test_create(self):
        url = self.get_url()
        with self.subTest('should require auth'):
            response = self.client.post(url)
            self.assertEqual(response.status_code, 401)
        self.client.force_login(self.user)
        self.room_role.role = RoomRoleEnum.USER
        self.db_session.add(self.room_role)
        self.db_session.commit()
        with self.subTest('should not allow to create invite without rights'):
            response = self.client.post(url)
            self.assertEqual(response.status_code, 403)
        self.room_role.role = RoomRoleEnum.MODERATOR
        self.db_session.add(self.room_role)
        self.db_session.exec(delete(RoomInvite).where(RoomInvite.chat_room_id == self.chat_room.id))
        self.db_session.commit()
        # expired_invite
        RoomInviteFactory(
            chat_room=self.chat_room,
            expires_at='2024-12-12T12:30:00',
        )
        # valid, but different room
        RoomInviteFactory()
        with self.subTest('should allow to create invite to mod'):
            response = self.client.post(url)
            self.assertEqual(response.status_code, 200)
            invite = self.db_session.exec(
                select(RoomInvite)
                .where(
                    RoomInvite.chat_room_id == self.chat_room.id,
                    RoomInvite.expires_at > '2025-01-01',
                )
            ).first()
            self.assertIsNotNone(invite)
            self.assertDictEqual(
                response.json(),
                {
                    'id': str(invite.id),
                },
            )
        self.room_role.role = RoomRoleEnum.ADMIN
        self.db_session.add(self.room_role)
        self.db_session.exec(delete(RoomInvite).where(RoomInvite.chat_room_id == self.chat_room.id))
        self.db_session.commit()
        with self.subTest('should allow to create invite to admin'):
            response = self.client.post(url)
            self.assertEqual(response.status_code, 200)
            invite = self.db_session.exec(
                select(RoomInvite)
                .where(
                    RoomInvite.chat_room_id == self.chat_room.id,
                )
            ).first()
            self.assertIsNotNone(invite)
            self.assertDictEqual(
                response.json(),
                {
                    'id': str(invite.id),
                },
            )
        self.db_session.exec(delete(RoomInvite).where(RoomInvite.chat_room_id == self.chat_room.id))
        self.db_session.commit()
        invite = RoomInviteFactory(chat_room=self.chat_room)
        with self.subTest('should return existing valid invite if exists'):
            response = self.client.post(url)
            self.assertEqual(response.status_code, 200)
            self.assertDictEqual(
                response.json(),
                {
                    'id': str(invite.id),
                },
            )
