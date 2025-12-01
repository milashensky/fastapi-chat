from fastapi import APIRouter, WebSocket
from starlette.websockets import WebSocketDisconnect

from auth.authorization import authenticate_token, CredentialValidationException
from websocket.manager import manager


websocket_router = APIRouter()


@websocket_router.websocket('/ws', name='websocket:connect')
async def websocket_endpoint(websocket: WebSocket, token: str | None = None):
    if not token:
        await websocket.close(code=4003)
        return
    try:
        user = await authenticate_token(token)
    except CredentialValidationException:
        await websocket.close(code=4003)
        return
    await manager.connect(websocket, user.id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)
