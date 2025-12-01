from enum import Enum

from fastapi import WebSocket


class WebSocketEventType(str, Enum):
    MESSAGE_CREATED = 'message_created'
    MESSAGE_UPDATED = 'message_updated'
    MESSAGE_DELETED = 'message_deleted'


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id not in self.active_connections:
            return
        self.active_connections[user_id].remove(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]

    async def send_to_user(self, user_id: int, message: dict):
        if user_id not in self.active_connections:
            return
        for connection in self.active_connections[user_id]:
            await connection.send_json(message)

    async def broadcast_to_users(self, user_ids: list[int], message: dict):
        for user_id in user_ids:
            await self.send_to_user(user_id, message)

    async def broadcast_to_room(self, room, event_type: WebSocketEventType, content: dict):
        user_ids = [role.user_id for role in room.roles]
        await self.broadcast_to_users(
            user_ids=user_ids,
            message={
                'type': event_type,
                'content': content,
            },
        )


manager = ConnectionManager()
