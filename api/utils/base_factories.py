import factory

class ModelFactory(factory.alchemy.SQLAlchemyModelFactory):
    @classmethod
    def _save(cls, model_class, session, args, kwargs):
        """refreshes the model post creation, making field values consistent.
        """
        obj = super()._save(model_class, session, args, kwargs)
        session.refresh(obj)
        return obj