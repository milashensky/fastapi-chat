from datetime import datetime

import sqlalchemy as sa
from sqlmodel import Field

from utils.utils import get_utc_now


class TimestampsMixin:
    """
    Simple created at and updated at timestamps.
    Usage:

    >>> class MyModel(TimestampsMixin, SQLModel):
    >>>    ...

    Notes:

    - Originally pulled from: https://github.com/tiangolo/sqlmodel/issues/252
    - Related issue: https://github.com/fastapi/sqlmodel/issues/539
    """

    created_at: datetime = Field(
        default_factory=get_utc_now,
        sa_type=sa.DateTime(timezone=True),
        sa_column_kwargs={"server_default": sa.func.now()},
        nullable=False,
    )

    updated_at: datetime | None = Field(
        default=None,
        sa_type=sa.DateTime(timezone=True),
        sa_column_kwargs={
            "onupdate": sa.func.now(),
            "server_default": sa.func.now(),
        },
    )
