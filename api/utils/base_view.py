from fastapi import HTTPException, Request, status


class BaseView:
    @classmethod
    def as_view(cls):

        async def handle_request(request: Request):
            view = cls()
            view.request = request
            return await view.dispatch(request=request)

        return handle_request

    async def dispatch(self, request: Request):
        method_handler = request.method.lower()
        handler = getattr(self, method_handler, None)
        if not handler:
            raise HTTPException(
                status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
                detail="Method is not allowed",
            )
        return await handler(request=request, **request.path_params)
