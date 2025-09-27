from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse as FastApiJsonResponse


class JsonResponse(FastApiJsonResponse):
    def __init__(self, content, *args, **kwargs):
        cleaned_content = content
        if not isinstance(content, (list, tuple, dict)):
            cleaned_content = jsonable_encoder(content)
        super().__init__(content=cleaned_content, *args, **kwargs)