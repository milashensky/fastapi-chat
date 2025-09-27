from fastapi import Request as FastApiRequest


class Request(FastApiRequest):
    user = None
    is_authenticated = False

    def __init__(self, scope, *args, **kwargs):
        super().__init__(scope, *args, **kwargs)
        self.user = scope.get('user')
        if self.user and (getattr(self.user, 'id', None)) is not None:
            self.is_authenticated = True