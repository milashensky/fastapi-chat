from chat.models import RoomRoleEnum
from chat.tests.factories import ChatRoomFactory, RoomRoleFactory
from db import session_factory
from utils.base_tests import ApiTestCase


class ChatApiTestCase(ApiTestCase):
    def setUp(self):
        super().setUp()
        self.db_session = session_factory()
        self.chat_room = ChatRoomFactory(
            created_by=self.user,
        )
        self.room_role = RoomRoleFactory(
            user=self.user,
            chat_room=self.chat_room,
            role=RoomRoleEnum.ADMIN,
        )
