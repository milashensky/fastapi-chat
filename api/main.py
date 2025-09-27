from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from auth.middleware import SessionUserMiddleware
from auth.router import auth_router
from conf import settings
from utils.serizalization import serialize_errors
from utils.exceptions import ValidationError

app = FastAPI(
    debug=settings.debug,
)

app.add_middleware(SessionUserMiddleware)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    error: RequestValidationError,
):
    return JSONResponse(
        status_code=400,
        content=jsonable_encoder(serialize_errors(error)),
    )



@app.exception_handler(ValidationError)
async def validation_error_handler(
    request: Request,
    error: ValidationError,
):
    return JSONResponse(
        status_code=400,
        content=jsonable_encoder(error.errors),
    )


app.include_router(auth_router, prefix='/api/auth')