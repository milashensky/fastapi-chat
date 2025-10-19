import { act } from '@testing-library/react'
import { useChatsStore } from '~/chat/chats-store'
import { describeHook } from '~/test/unit/hookTest'
import { manualPromise } from '~/test/unit/manualPromise'
import { toValue } from '~/utils/stateRef'
import { useChatEdit } from '../use-chat-edit'


vi.mock('zustand')

describeHook('use-chat-edit', ({ mountHook }) => {
    const roomId = 1
    const form = { name: 'New Chat Name' }

    describe('submit', () => {
        it('should send update chat request if form is valid', async () => {
            const updateChat = manualPromise()
            useChatsStore.setState({
                update: updateChat,
            })
            const validate = vi.fn().mockReturnValue(true)
            const onSuccess = vi.fn()
            const controller = mountHook({
                roomId,
                form,
                actions: {
                    validate,
                    onSuccess,
                },
            })
            await act(async () => {
                controller.current.submit()
            })
            expect(validate).toHaveBeenCalled()
            expect(toValue(controller.current.isPending)).toStrictEqual(true)
            await act(async () => await updateChat.resolve())
            expect(toValue(controller.current.isPending)).toStrictEqual(false)
            expect(updateChat).toHaveBeenCalledWith(roomId, form)
            expect(onSuccess).toHaveBeenCalled()
        })

        it('should not send update chat request if form is not valid', async () => {
            const updateChat = vi.fn().mockResolvedValue()
            useChatsStore.setState({
                update: updateChat,
            })
            const validate = vi.fn().mockReturnValue(false)
            const onSuccess = vi.fn()
            const controller = mountHook({
                roomId,
                form,
                actions: {
                    validate,
                    onSuccess,
                },
            })
            await act(async () => controller.current.submit())
            expect(validate).toHaveBeenCalled()
            expect(toValue(controller.current.isPending)).toStrictEqual(false)
            expect(updateChat).not.toHaveBeenCalled()
            expect(onSuccess).not.toHaveBeenCalled()
        })

        it('should set isPending to false if update chat request fails', async () => {
            const updateChat = manualPromise()
            useChatsStore.setState({
                update: updateChat,
            })
            const validate = vi.fn().mockReturnValue(true)
            const onSuccess = vi.fn()
            const controller = mountHook({
                roomId,
                form,
                actions: {
                    validate,
                    onSuccess,
                },
            })
            await act(async () => {
                controller.current.submit()
            })
            expect(validate).toHaveBeenCalled()
            expect(toValue(controller.current.isPending)).toStrictEqual(true)
            await act(async () => await updateChat.reject(new Error('Update failed')))
            expect(toValue(controller.current.isPending)).toStrictEqual(false)
            expect(updateChat).toHaveBeenCalledWith(roomId, form)
            expect(onSuccess).not.toHaveBeenCalled()
        })
    })
}, {
    constructor: useChatEdit,
})
