import { act } from '@testing-library/react'
import { useChatsStore } from '~/chat/chats-store'
import { toValue } from '~/utils/stateRef'
import { BadResponseError } from '~/utils/request'
import { chatRoomFactory } from '~/test/factories/chatRoom'
import { describeHook } from '~/test/unit/hookTest'
import { manualPromise } from '~/test/unit/manualPromise'
import { useCreateChat } from '../use-create-chat'


vi.mock('zustand')

const name = 'somebody once told me'

describeHook('use-create-store', ({ mountHook }) => {
    describe('submit', () => {

        it('should send create request if form is valid', async () => {
            const room = chatRoomFactory()
            const create = manualPromise()
            useChatsStore.setState({
                create,
            })
            const validate = vi.fn().mockReturnValue(true)
            const onSuccess = vi.fn()
            const hook = mountHook({
                actions: {
                    validate,
                    onSuccess,
                },
            })
            await act(async () => {
                hook.current.submit()
            })
            expect(toValue(hook.current.isPending)).toBe(true)
            expect(validate).toHaveBeenCalled()
            await act(async () => create.resolve(room))
            expect(toValue(hook.current.isPending)).toBe(false)
            expect(toValue(hook.current.errors)).toStrictEqual({})
            expect(create).toHaveBeenCalledWith({ name })
            expect(onSuccess).toHaveBeenCalledWith(room)
        })

        it('should send not send create request if form is not valid', async () => {
            const create = vi.fn()
            useChatsStore.setState({
                create,
            })
            const validate = vi.fn().mockReturnValue(false)
            const onSuccess = vi.fn()
            const hook = mountHook({
                actions: {
                    validate,
                    onSuccess,
                },
            })
            await act(async () => hook.current.submit())
            expect(validate).toHaveBeenCalled()
            expect(toValue(hook.current.isPending)).toBe(false)
            expect(toValue(hook.current.errors)).toStrictEqual({})
            expect(create).not.toHaveBeenCalled()
            expect(onSuccess).not.toHaveBeenCalled()
        })

        it('should return errors if create request fails', async () => {
            const errors = {
                name: ['somebody'],
            }
            const create = manualPromise()
            useChatsStore.setState({
                create,
            })
            const validate = vi.fn().mockReturnValue(true)
            const onSuccess = vi.fn()
            const hook = mountHook({
                actions: {
                    validate,
                    onSuccess,
                },
            })
            await act(async () => {
                hook.current.submit()
            })
            expect(toValue(hook.current.isPending)).toBe(true)
            expect(validate).toHaveBeenCalled()
            await act(async () => create.reject(new BadResponseError({ data: errors })))
            expect(toValue(hook.current.isPending)).toBe(false)
            expect(toValue(hook.current.errors)).toStrictEqual(errors)
            expect(create).toHaveBeenCalledWith({ name })
            expect(onSuccess).not.toHaveBeenCalled()
        })
    })
}, {
    constructor: useCreateChat,
    defaults: {
        name,
    },
})
