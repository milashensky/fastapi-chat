from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field()
    email: str = Field(index=True)
    password: str = Field(default=None)

    def sqlmodel_update(self, obj, *, update):
        return super().sqlmodel_update(obj=obj, update=update)


class Session(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")