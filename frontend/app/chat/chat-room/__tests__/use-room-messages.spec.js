import { act } from '@testing-library/react'
import { toValue } from '~/utils/stateRef'
import { MessageTypeEnum } from '~/chat/types'
import { useMessagesStore } from '~/chat/messages-store'
import { chatMessageFactory } from '~/test/factories/chatMessage'
import { paginatedResponseFactory } from '~/test/factories/paginatedResponse'
import { describeHook } from '~/test/unit/hookTest'
import { manualPromise } from '~/test/unit/manualPromise'
import { useRoomMessages } from '../use-room-messages'


vi.mock('zustand')

const roomId = 1

describeHook('useRoomMessages', ({ mountHook }) => {
    describe('messages', () => {
        const message1Room1 = chatMessageFactory({
            chat_room_id: 1,
            created_at: '2025-12-12T12:30:00',
            content: 'the world is gonna roll me',
        })
        const message2Room1 = chatMessageFactory({
            chat_room_id: 1,
            created_at: '2024-11-12T12:30:00',
            type: MessageTypeEnum.SYSTEM_ANNOUNCEMENT,
            content: 'somebody told me',
        })
        const message3Room1 = chatMessageFactory({
            chat_room_id: 1,
            created_at: '2025-11-12T12:30:00',
            type: MessageTypeEnum.TEXT,
            content: 'somebody once told me',
        })
        const message1Room2 = chatMessageFactory({ chat_room_id: 2 })
        const message2Room2 = chatMessageFactory({ chat_room_id: 2 })

        it('should return stored messages for chat room ordered freshest first', async () => {
            useMessagesStore.setState({
                messages: {
                    [message1Room1.id]: message1Room1,
                    [message2Room1.id]: message2Room1,
                    [message3Room1.id]: message3Room1,
                    [message1Room2.id]: message1Room2,
                    [message2Room2.id]: message2Room2,
                },
            })
            const controller = mountHook()
            expect(controller.current.messages).toStrictEqual([
                message2Room1,
                message3Room1,
                message1Room1,
            ])
        })

        it('should return text messages matching search if defined', async () => {
            useMessagesStore.setState({
                messages: {
                    [message1Room1.id]: message1Room1,
                    [message2Room1.id]: message2Room1,
                    [message3Room1.id]: message3Room1,
                },
            })
            const controller = mountHook({
                search: 'told Me  ',
            })
            expect(controller.current.messages).toStrictEqual([
                message3Room1,
            ])
        })

        it('should update on messages update', async () => {
            useMessagesStore.setState({
                messages: {
                    [message1Room1.id]: message1Room1,
                    [message2Room1.id]: message2Room1,
                },
            })
            const controller = mountHook()
            expect(controller.current.messages.length).toBe(2)
            await act(() => {
                useMessagesStore.setState({
                    messages: {
                        [message1Room1.id]: message1Room1,
                        [message2Room1.id]: message2Room1,
                        [message3Room1.id]: message3Room1,
                    },
                })
            })
            expect(controller.current.messages.length).toBe(3)
        })
    })

    describe('fetchNext', () => {
        it('should fetch next page of messages for room', async () => {
            const listMessagesMock = manualPromise()
            useMessagesStore.setState({
                list: listMessagesMock,
            })
            const controller = mountHook()
            await act(async () => {
                controller.current.fetchNext()
            })
            expect(toValue(controller.current.isLoading)).toBe(true)
            const response1 = paginatedResponseFactory({
                next: 2,
            })
            await act(async () => listMessagesMock.resolve(response1))
            expect(toValue(controller.current.isLoading)).toBe(false)
            expect(listMessagesMock).toHaveBeenCalledWith({
                roomId,
                filters: {
                    page: 1,
                },
            })
            const response2 = paginatedResponseFactory({
                next: 3,
            })
            await act(async () => {
                controller.current.fetchNext()
                listMessagesMock.resolve(response2)
            })
            expect(listMessagesMock).toHaveBeenCalledWith({
                roomId,
                filters: {
                    page: 2,
                },
            })
        })

        it('should support search', async () => {
            const listMessagesMock = vi.fn().mockResolvedValue(paginatedResponseFactory())
            useMessagesStore.setState({
                list: listMessagesMock,
            })
            const search = 'somebody once told me'
            const controller = mountHook({
                search,
            })
            await act(async () => controller.current.fetchNext())
            expect(listMessagesMock).toHaveBeenCalledWith({
                roomId,
                filters: {
                    page: expect.anything(),
                    search,
                },
            })
        })

        it('should should set canFetchNext to true if next page exists', async () => {
            const listMessagesMock = vi.fn().mockResolvedValue(paginatedResponseFactory({ next: 2 }))
            useMessagesStore.setState({
                list: listMessagesMock,
            })
            const search = 'somebody once told me'
            const controller = mountHook({
                search,
            })
            await act(async () => controller.current.fetchNext())
            expect(toValue(controller.current.canFetchNext)).toBe(true)
        })

        it('should should set canFetchNext to false if no next page', async () => {
            const listMessagesMock = vi.fn().mockResolvedValue(paginatedResponseFactory({ next: null }))
            useMessagesStore.setState({
                list: listMessagesMock,
            })
            const search = 'somebody once told me'
            const controller = mountHook({
                search,
            })
            await act(async () => controller.current.fetchNext())
            expect(toValue(controller.current.canFetchNext)).toBe(false)
        })
    })
}, {
    constructor: useRoomMessages,
    defaults: {
        roomId,
    },
})
