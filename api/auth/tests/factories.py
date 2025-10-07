import factory
from auth.models import User
from utils.base_factories import ModelFactory


class UserFactory(ModelFactory):
    name = factory.Faker('name')
    email = factory.Sequence(lambda n: f'user.{n}@test.com')
    password = factory.Faker('password')
    is_active = True

    class Meta:
        model = User
