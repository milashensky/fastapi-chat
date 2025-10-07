import factory
from chat.models import (
    ChatRoom,
    Message,
    RoomInvite,
    RoomRole,
)
from utils.base_factories import ModelFactory


class ChatRoomFactory(ModelFactory):
    name = factory.Faker('lexify')
    created_by = factory.SubFactory('auth.tests.factories.UserFactory')
    created_by_id = factory.SelfAttribute('created_by.id')

    class Meta:
        model = ChatRoom


class MessageFactory(ModelFactory):
    content = factory.Faker('sentence')
    created_by = factory.SubFactory('auth.tests.factories.UserFactory')
    created_by_id = factory.SelfAttribute('created_by.id')
    chat_room_id = factory.SubFactory(ChatRoomFactory)

    class Meta:
        model = Message


class RoomRoleFactory(ModelFactory):
    chat_room = factory.SubFactory(ChatRoomFactory)
    user = factory.SubFactory('auth.tests.factories.UserFactory')

    class Meta:
        model = RoomRole


class RoomInviteFactory(ModelFactory):
    chat_room = factory.SubFactory(ChatRoomFactory)
    created_by = factory.SubFactory('auth.tests.factories.UserFactory')
    created_by_id = factory.SelfAttribute('created_by.id')

    class Meta:
        model = RoomInvite
