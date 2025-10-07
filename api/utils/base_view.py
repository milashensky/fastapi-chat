from typing import Protocol
from fastapi import HTTPException, status
from fastapi import Request as BaseRequest
from sqlmodel import Session
from db import SessionDep
from utils.request import Request



class Authorizer(Protocol):
    def __call__(self, request: Request, view: object) -> None: ...


class BaseApi:
    authorizers: list[Authorizer] | None = None
    db_session: Session

    @classmethod
    def as_view(cls):

        async def handle_request(request: BaseRequest, db_session: SessionDep):
            view = cls()
            wrapped_request = Request(
                scope=request.scope,
                receive=request._receive,
                send=request._send,
            )
            view.request = wrapped_request
            view.db_session = db_session
            return await view.dispatch(request=wrapped_request)

        return handle_request

    async def dispatch(self, request: Request):
        self.authorize_request(request)
        method_handler = request.method.lower()
        handler = getattr(self, method_handler, None)
        if not handler:
            raise HTTPException(
                status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
                detail="Method is not allowed",
            )
        return await handler(request=request, **request.path_params)

    def authorize_request(self, request: Request):
        if not self.authorizers:
            return
        for authorizer in self.authorizers:
            authorizer(request, view=self)
