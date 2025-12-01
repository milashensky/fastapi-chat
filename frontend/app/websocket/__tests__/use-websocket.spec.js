import { describeHook } from '~/test/unit/hookTest'
import { useAuthStore } from '~/auth/auth-store'
import { useMessagesStore } from '~/chat/messages-store'
import { accessTokenFactory } from '~/test/factories/accessToken'
import { chatMessageFactory } from '~/test/factories/chatMessage'
import { wsClient, WebSocketEventType } from '../websocket-client'
import { useWebsocket } from '../use-websocket'


vi.mock('zustand')
vi.mock('../websocket-client')

describeHook('useWebsocket', ({ mountHook }) => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('connection', () => {
        it('should connect websocket when access token is present', () => {
            useAuthStore.setState({
                accessToken: accessTokenFactory(),
            })
            mountHook()
            expect(wsClient.connect).toHaveBeenCalled()
        })

        it('should not connect websocket when access token is absent', () => {
            useAuthStore.setState({
                accessToken: null,
            })
            mountHook()
            expect(wsClient.connect).not.toHaveBeenCalled()
        })

        it('should disconnect websocket on unmount', () => {
            useAuthStore.setState({
                accessToken: accessTokenFactory(),
            })
            const hook = mountHook()
            hook.unmount()
            expect(wsClient.disconnect).toHaveBeenCalled()
        })

        it('should disconnect and reconnect when access token changes', () => {
            useAuthStore.setState({
                accessToken: accessTokenFactory(),
            })
            mountHook()
            expect(wsClient.disconnect).toHaveBeenCalledTimes(1)
            expect(wsClient.connect).toHaveBeenCalledTimes(1)
        })

        it('should only disconnect when access token is removed', () => {
            useAuthStore.setState({
                accessToken: null,
            })
            mountHook()
            expect(wsClient.disconnect).toHaveBeenCalledTimes(1)
            expect(wsClient.connect).not.toHaveBeenCalled()
        })
    })

    describe('event subscriptions', () => {
        it('should register MESSAGE_CREATED event handler', () => {
            useAuthStore.setState({
                accessToken: accessTokenFactory(),
            })
            mountHook()
            expect(wsClient.on).toHaveBeenCalledWith(
                WebSocketEventType.MESSAGE_CREATED,
                expect.any(Function),
            )
        })

        it('should register MESSAGE_UPDATED event handler', () => {
            useAuthStore.setState({
                accessToken: accessTokenFactory(),
            })
            mountHook()
            expect(wsClient.on).toHaveBeenCalledWith(
                WebSocketEventType.MESSAGE_UPDATED,
                expect.any(Function),
            )
        })

        it('should register MESSAGE_DELETED event handler', () => {
            useAuthStore.setState({
                accessToken: accessTokenFactory(),
            })
            mountHook()
            expect(wsClient.on).toHaveBeenCalledWith(
                WebSocketEventType.MESSAGE_DELETED,
                expect.any(Function),
            )
        })

        it('should store message on MESSAGE_CREATED event', () => {
            const storeMessage = vi.fn()
            useAuthStore.setState({
                accessToken: accessTokenFactory(),
            })
            useMessagesStore.setState({
                storeMessage,
            })
            let messageCreatedCallback
            wsClient.on.mockImplementation((eventType, callback) => {
                if (eventType === WebSocketEventType.MESSAGE_CREATED) {
                    messageCreatedCallback = callback
                }
            })
            mountHook()
            const message = chatMessageFactory()
            messageCreatedCallback(message)
            expect(storeMessage).toHaveBeenCalledWith(message.id, message)
        })

        it('should store message on MESSAGE_UPDATED event', () => {
            const storeMessage = vi.fn()
            useAuthStore.setState({
                accessToken: accessTokenFactory(),
            })
            useMessagesStore.setState({
                storeMessage,
            })
            let messageUpdatedCallback
            wsClient.on.mockImplementation((eventType, callback) => {
                if (eventType === WebSocketEventType.MESSAGE_UPDATED) {
                    messageUpdatedCallback = callback
                }
            })
            mountHook()
            const message = chatMessageFactory()
            messageUpdatedCallback(message)
            expect(storeMessage).toHaveBeenCalledWith(message.id, message)
        })

        it('should unstore message on MESSAGE_DELETED event', () => {
            const unstoreMessage = vi.fn()
            useAuthStore.setState({
                accessToken: accessTokenFactory(),
            })
            useMessagesStore.setState({
                unstoreMessage,
            })
            let messageDeletedCallback
            wsClient.on.mockImplementation((eventType, callback) => {
                if (eventType === WebSocketEventType.MESSAGE_DELETED) {
                    messageDeletedCallback = callback
                }
            })
            mountHook()
            const messageId = 123
            messageDeletedCallback({ id: messageId })
            expect(unstoreMessage).toHaveBeenCalledWith(messageId)
        })

        it('should unregister event handlers on unmount', () => {
            useAuthStore.setState({
                accessToken: accessTokenFactory(),
            })
            const handlers = {}
            wsClient.on.mockImplementation((eventType, callback) => {
                handlers[eventType] = callback
            })
            const hook = mountHook()
            hook.unmount()
            expect(wsClient.off).toHaveBeenCalledWith(
                WebSocketEventType.MESSAGE_CREATED,
                handlers[WebSocketEventType.MESSAGE_CREATED],
            )
            expect(wsClient.off).toHaveBeenCalledWith(
                WebSocketEventType.MESSAGE_UPDATED,
                handlers[WebSocketEventType.MESSAGE_UPDATED],
            )
            expect(wsClient.off).toHaveBeenCalledWith(
                WebSocketEventType.MESSAGE_DELETED,
                handlers[WebSocketEventType.MESSAGE_DELETED],
            )
        })
    })
}, {
    constructor: useWebsocket,
})
