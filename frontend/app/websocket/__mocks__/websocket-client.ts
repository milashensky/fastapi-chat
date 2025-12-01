import { vi } from 'vitest'


export const WebSocketEventType = {
    MESSAGE_CREATED: 'message_created',
    MESSAGE_UPDATED: 'message_updated',
    MESSAGE_DELETED: 'message_deleted',
}

export const wsClient = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(() => vi.fn()),
    off: vi.fn(),
}
