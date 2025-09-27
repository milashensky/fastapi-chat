from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from auth.middleware import SessionUserMiddleware
from auth.router import auth_router
from conf import settings
from utils.serizalization import serialize_errors

app = FastAPI(
    debug=settings.debug,
)

app.add_middleware(SessionUserMiddleware)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    return JSONResponse(
        status_code=400,
        content=jsonable_encoder(serialize_errors(exc)),
    )

app.include_router(auth_router, prefix='/api/auth')