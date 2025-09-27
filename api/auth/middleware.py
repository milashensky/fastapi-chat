from utils.request import Request
from starlette.types import ASGIApp, Receive, Scope, Send


class SessionUserMiddleware:
    def __init__(self, app: ASGIApp, *args, **kwargs):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        from auth.authorization import oauth2_scheme, authenticate_token, CredentialValidationException
        request = Request(scope, receive=receive, send=send)
        token = await oauth2_scheme(request)
        try:
            authenticated_user = await authenticate_token(token)
        except CredentialValidationException:
            authenticated_user = None
        scope['user'] = authenticated_user
        scope['token'] = token
        await self.app(scope, receive, send)