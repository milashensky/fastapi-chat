import { useEffect, useCallback } from 'react'
import { useAuthStore } from '~/auth/auth-store'
import { useMessagesStore } from '~/chat/messages-store'
import type { ChatMessage } from '~/chat/types'
import { wsClient, WebSocketEventType } from './websocket-client'


export function useWebsocket() {
    const accessToken = useAuthStore((state) => state.accessToken)
    const storeMessage = useMessagesStore((state) => state.storeMessage)
    const unstoreMessage = useMessagesStore((state) => state.unstoreMessage)
    const updateStoredMessage = useCallback((message: ChatMessage) => {
        storeMessage(message.id, message)
    }, [storeMessage])
    const deleteStoredMessage = useCallback((data: { id: number }) => {
        unstoreMessage(data.id)
    }, [unstoreMessage])
    useEffect(() => {
        wsClient.disconnect()
        if (!accessToken) {
            return
        }
        wsClient.connect()
        wsClient.on(WebSocketEventType.MESSAGE_CREATED, updateStoredMessage)
        wsClient.on(WebSocketEventType.MESSAGE_UPDATED, updateStoredMessage)
        wsClient.on(WebSocketEventType.MESSAGE_DELETED, deleteStoredMessage)
        return () => {
            wsClient.off(WebSocketEventType.MESSAGE_CREATED, updateStoredMessage)
            wsClient.off(WebSocketEventType.MESSAGE_UPDATED, updateStoredMessage)
            wsClient.off(WebSocketEventType.MESSAGE_DELETED, deleteStoredMessage)
            wsClient.disconnect()
        }
    }, [
        accessToken,
        updateStoredMessage,
        deleteStoredMessage,
    ])
}
