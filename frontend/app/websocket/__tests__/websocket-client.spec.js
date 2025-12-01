import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from '~/auth/auth-store'
import { MockWebSocket } from '~/websocket/__mocks__/websocket'
import { accessTokenFactory } from '~/test/factories/accessToken'
import {
    WebSocketClient,
    WebSocketEventType,
    PING_INTERVAL_MS,
    RECONNECT_DELAY_MS,
} from '../websocket-client'


describe('WebSocketClient', () => {
    const accessToken = accessTokenFactory()
    let client

    beforeEach(() => {
        vi.useFakeTimers()
        vi.stubEnv('VITE_WEBSOCKET_URL', 'ws://localhost:8000')
        useAuthStore.setState({
            accessToken,
        })
        client = new WebSocketClient()
    })

    afterEach(() => {
        client.disconnect()
        vi.useRealTimers()
    })

    describe('connect', () => {
        it('should not connect without access token', () => {
            useAuthStore.setState({ accessToken: null })
            client.connect()
            expect(MockWebSocket.instances).toHaveLength(0)
        })

        it('should connect with access token', () => {
            client.connect()
            expect(MockWebSocket.instances).toHaveLength(1)
            expect(MockWebSocket.instances[0].url).toContain(`token=${accessToken.token}`)
        })

        it('should use websocket url from env variable', () => {
            client.connect()
            expect(MockWebSocket.instances[0].url).toMatch(/^ws:\/\/localhost:8000\/api\/websocket\/ws/)
        })
    })

    describe('ping', () => {
        it('should send ping periodically after connection is open', () => {
            client.connect()
            const ws = MockWebSocket.instances[0]
            ws.simulateOpen()
            expect(ws.sentMessages).toHaveLength(0)
            vi.advanceTimersByTime(PING_INTERVAL_MS)
            expect(ws.sentMessages).toEqual(['ping'])
            vi.advanceTimersByTime(PING_INTERVAL_MS)
            expect(ws.sentMessages).toEqual(['ping', 'ping'])
        })

        it('should stop ping on disconnect', () => {
            client.connect()
            const ws = MockWebSocket.instances[0]
            ws.simulateOpen()
            vi.advanceTimersByTime(PING_INTERVAL_MS)
            expect(ws.sentMessages).toHaveLength(1)
            client.disconnect()
            vi.advanceTimersByTime(PING_INTERVAL_MS * 2)
            // no new messages
            expect(ws.sentMessages).toHaveLength(1)
        })
    })

    describe('reconnect', () => {
        it('should reconnect after unexpected close', () => {
            client.connect()
            const ws = MockWebSocket.instances[0]
            ws.simulateOpen()
            ws.simulateClose()
            expect(MockWebSocket.instances).toHaveLength(1)
            vi.advanceTimersByTime(RECONNECT_DELAY_MS)
            expect(MockWebSocket.instances).toHaveLength(2)
        })

        it('should not reconnect after intentional disconnect', () => {
            client.connect()
            const ws = MockWebSocket.instances[0]
            ws.simulateOpen()
            client.disconnect()
            vi.advanceTimersByTime(RECONNECT_DELAY_MS * 2)
            expect(MockWebSocket.instances).toHaveLength(1)
        })

        it('should not reconnect if access token is gone', () => {
            client.connect()
            const ws = MockWebSocket.instances[0]
            ws.simulateOpen()
            useAuthStore.setState({ accessToken: null })
            ws.simulateClose()
            vi.advanceTimersByTime(RECONNECT_DELAY_MS * 2)
            expect(MockWebSocket.instances).toHaveLength(1)
        })
    })

    describe('on/off', () => {
        it('should call callback when matching event received', () => {
            const callback = vi.fn()
            client.connect()
            client.on(WebSocketEventType.MESSAGE_CREATED, callback)
            const ws = MockWebSocket.instances[0]
            ws.simulateOpen()
            ws.simulateMessage({
                type: WebSocketEventType.MESSAGE_CREATED,
                content: { id: 1, text: 'Hello' },
            })
            expect(callback).toHaveBeenCalledWith({ id: 1, text: 'Hello' })
        })

        it('should not call callback for non-matching event', () => {
            const callback = vi.fn()
            client.connect()
            client.on(WebSocketEventType.MESSAGE_CREATED, callback)
            const ws = MockWebSocket.instances[0]
            ws.simulateOpen()
            ws.simulateMessage({
                type: WebSocketEventType.MESSAGE_DELETED,
                content: { id: 1 },
            })
            expect(callback).not.toHaveBeenCalled()
        })

        it('should support multiple callbacks for same event', () => {
            const callback1 = vi.fn()
            const callback2 = vi.fn()
            client.connect()
            client.on(WebSocketEventType.MESSAGE_CREATED, callback1)
            client.on(WebSocketEventType.MESSAGE_CREATED, callback2)
            const ws = MockWebSocket.instances[0]
            ws.simulateOpen()
            ws.simulateMessage({
                type: WebSocketEventType.MESSAGE_CREATED,
                content: { id: 1 },
            })
            expect(callback1).toHaveBeenCalled()
            expect(callback2).toHaveBeenCalled()
        })

        it('should remove callback with off', () => {
            const callback = vi.fn()
            client.connect()
            client.on(WebSocketEventType.MESSAGE_CREATED, callback)
            const ws = MockWebSocket.instances[0]
            ws.simulateOpen()
            client.off(WebSocketEventType.MESSAGE_CREATED, callback)
            ws.simulateMessage({
                type: WebSocketEventType.MESSAGE_CREATED,
                content: { id: 1 },
            })
            expect(callback).not.toHaveBeenCalled()
        })
    })

    describe('disconnect', () => {
        it('should clear all callbacks on disconnect', () => {
            const callback = vi.fn()
            client.connect()
            client.on(WebSocketEventType.MESSAGE_CREATED, callback)
            const ws = MockWebSocket.instances[0]
            ws.simulateOpen()
            client.disconnect()
            client.connect()
            const ws2 = MockWebSocket.instances[1]
            ws2.simulateOpen()
            ws2.simulateMessage({
                type: WebSocketEventType.MESSAGE_CREATED,
                content: { id: 1 },
            })
            expect(callback).not.toHaveBeenCalled()
        })

        it('should handle disconnect without prior connect', () => {
            expect(() => client.disconnect()).not.toThrow()
        })
    })
})
