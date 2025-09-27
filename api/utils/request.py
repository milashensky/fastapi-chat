from fastapi import Request as FastApiRequest

from auth.authorization import decode_token
from auth.schemas import AccessToken


class Request(FastApiRequest):
    user = None
    is_authenticated = False

    def __init__(self, scope, *args, **kwargs):
        super().__init__(scope, *args, **kwargs)
        self.user = scope.get('user')
        if self.user and (getattr(self.user, 'id', None)) is not None:
            self.is_authenticated = True

    @property
    def access_token(self) -> AccessToken | None:
        token = self.scope.get('token')
        if not token:
            return None
        decoded_token = decode_token(token)
        return AccessToken(
            token=token,
            expires_at=decoded_token['expires_at']
        )