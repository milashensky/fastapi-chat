import { useAuthStore } from '~/auth/auth-store'


export enum WebSocketEventType {
    MESSAGE_CREATED = 'message_created',
    MESSAGE_UPDATED = 'message_updated',
    MESSAGE_DELETED = 'message_deleted',
}

export interface WebSocketMessage<T = unknown> {
    type: WebSocketEventType
    content: T
}

type EventCallback<T = unknown> = (content: T) => void

type EventCallbacks = {
    [key in WebSocketEventType]: Set<EventCallback>
}

export const PING_INTERVAL_MS = 30000
export const RECONNECT_DELAY_MS = 3000

export class WebSocketClient {
    private socket: WebSocket | null = null
    private pingIntervalId: NodeJS.Timeout | null = null
    private reconnectTimeoutId: NodeJS.Timeout | null = null
    private callbacks: EventCallbacks = {
        [WebSocketEventType.MESSAGE_CREATED]: new Set(),
        [WebSocketEventType.MESSAGE_UPDATED]: new Set(),
        [WebSocketEventType.MESSAGE_DELETED]: new Set(),
    }
    private isIntentionallyClosed = false

    connect(): void {
        const { accessToken } = useAuthStore.getState()
        if (!accessToken) {
            return
        }
        this.isIntentionallyClosed = false
        const wsUrl = `${import.meta.env.VITE_WEBSOCKET_URL}/api/websocket/ws?token=${accessToken.token}`
        this.socket = new WebSocket(wsUrl)
        this.socket.onopen = this.handleOpen.bind(this)
        this.socket.onmessage = this.handleMessage.bind(this)
        this.socket.onclose = this.handleClose.bind(this)
        this.socket.onerror = this.handleError.bind(this)
    }

    disconnect(): void {
        this.isIntentionallyClosed = true
        this.cleanup()
        this.clearAllCallbacks()
    }

    on<T>(eventType: WebSocketEventType, callback: EventCallback<T>): void {
        this.callbacks[eventType].add(callback as EventCallback)
    }

    off<T>(eventType: WebSocketEventType, callback: EventCallback<T>): void {
        this.callbacks[eventType].delete(callback as EventCallback)
    }

    private handleOpen(): void {
        console.debug('WebSocket connected')
        this.startPing()
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const message: WebSocketMessage = JSON.parse(event.data)
            const callbacks = this.callbacks[message.type]
            if (callbacks) {
                callbacks.forEach((callback) => callback(message.content))
            }
        }
        catch (error) {
            console.error('Failed to parse WebSocket message:', error)
        }
    }

    private handleClose(): void {
        console.debug('WebSocket closed')
        this.stopPing()
        if (!this.isIntentionallyClosed) {
            this.scheduleReconnect()
        }
    }

    private handleError(event: Event): void {
        console.error('WebSocket error:', event)
    }

    private startPing(): void {
        this.pingIntervalId = setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send('ping')
            }
        }, PING_INTERVAL_MS)
    }

    private stopPing(): void {
        if (this.pingIntervalId) {
            clearInterval(this.pingIntervalId)
            this.pingIntervalId = null
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimeoutId) {
            return
        }
        this.reconnectTimeoutId = setTimeout(() => {
            this.reconnectTimeoutId = null
            const { accessToken } = useAuthStore.getState()
            if (accessToken) {
                console.debug('WebSocket reconnecting...')
                this.connect()
            }
        }, RECONNECT_DELAY_MS)
    }

    private cleanup(): void {
        this.stopPing()
        if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId)
            this.reconnectTimeoutId = null
        }
        if (this.socket) {
            this.socket.close()
            this.socket = null
        }
    }

    clearAllCallbacks(): void {
        this.callbacks[WebSocketEventType.MESSAGE_CREATED].clear()
        this.callbacks[WebSocketEventType.MESSAGE_UPDATED].clear()
        this.callbacks[WebSocketEventType.MESSAGE_DELETED].clear()
    }
}

export const wsClient = new WebSocketClient()
