import factory
from db import session_factory


class ModelFactory(factory.alchemy.SQLAlchemyModelFactory):
    @classmethod
    def _save(cls, model_class, session, args, kwargs):
        """refreshes the model post creation, making field values consistent.
        """
        obj = super()._save(model_class, session, args, kwargs)
        session.refresh(obj)
        return obj

    class Meta:
        sqlalchemy_session_factory = session_factory
        sqlalchemy_session_persistence = 'commit'
