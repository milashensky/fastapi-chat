import { act } from '@testing-library/react'
import { textMessageFactory } from '~/test/factories/chatMessage'
import { useMessagesStore } from '~/chat/messages-store'
import { describeHook } from '~/test/unit/hookTest'
import { useChatRoomContext } from '../chat-room-context'


vi.mock('zustand')

describeHook('useChatRoomContext', ({ mountHook }) => {
    const roomId = 1

    beforeEach(() => {
        useMessagesStore.setState({
            messages: {},
            create: vi.fn().mockResolvedValue({}),
            update: vi.fn().mockResolvedValue({}),
        })
    })

    describe('editingMessage', () => {
        it('should return null when no message is being edited', () => {
            const context = mountHook({ roomId })
            expect(context.current.editingMessage).toBeNull()
        })

        it('should return message from store when editingMessageId is set', () => {
            const message = textMessageFactory({ id: 123 })
            useMessagesStore.setState({
                messages: { [message.id]: message },
            })
            const context = mountHook({ roomId })
            act(() => {
                context.current.setEditingMessageId(123)
            })
            expect(context.current.editingMessage).toEqual(message)
        })

        it('should return null when message is deleted from store', () => {
            const message = textMessageFactory({ id: 123 })
            useMessagesStore.setState({
                messages: { [message.id]: message },
            })
            const context = mountHook({ roomId })
            act(() => {
                context.current.setEditingMessageId(123)
            })
            expect(context.current.editingMessage).toEqual(message)
            act(() => {
                useMessagesStore.setState({ messages: {} })
            })
            expect(context.current.editingMessage).toBeNull()
        })
    })

    describe('sendMessage', () => {
        it('should create message when not editing', async () => {
            const create = vi.fn().mockResolvedValue({})
            const update = vi.fn()
            useMessagesStore.setState({ create, update })
            const context = mountHook({ roomId })
            await act(async () => {
                await context.current.sendMessage('new message')
            })
            expect(create).toHaveBeenCalledWith({ content: 'new message' }, { roomId })
            expect(update).not.toHaveBeenCalled()
        })

        it('should update message when editing', async () => {
            const message = textMessageFactory({ id: 123 })
            const create = vi.fn()
            const update = vi.fn().mockResolvedValue({})
            useMessagesStore.setState({
                create,
                update,
                messages: { [message.id]: message },
            })
            const context = mountHook({ roomId })
            act(() => {
                context.current.setEditingMessageId(123)
            })
            await act(async () => {
                await context.current.sendMessage('updated content')
            })
            expect(update).toHaveBeenCalledWith(123, { content: 'updated content' })
            expect(create).not.toHaveBeenCalled()
            expect(context.current.editingMessage).toBeNull()
        })

        it('should create message when editingMessageId is set but message is deleted', async () => {
            const create = vi.fn().mockResolvedValue({})
            const update = vi.fn()
            useMessagesStore.setState({
                create,
                update,
                messages: {},
            })
            const context = mountHook({ roomId })
            act(() => {
                context.current.setEditingMessageId(123)
            })
            await act(async () => {
                await context.current.sendMessage('new message')
            })
            expect(create).toHaveBeenCalledWith({ content: 'new message' }, { roomId })
            expect(update).not.toHaveBeenCalled()
        })
    })
}, {
    constructor: useChatRoomContext,
})
