import { act } from '@testing-library/react'
import { useChatsStore } from '~/chat/chats-store'
import { RoomRoleEnum } from '~/chat/types'
import { describeHook } from '~/test/unit/hookTest'
import { manualPromise } from '~/test/unit/manualPromise'
import { toValue } from '~/utils/stateRef'
import { useRoleEdit } from '../use-role-edit'


vi.mock('zustand')

describeHook('use-role-edit', ({ mountHook }) => {
    const roomRoleId = 1
    const role = RoomRoleEnum.MODERATOR

    describe('submit', () => {
        it('should send update role request if form is valid', async () => {
            const updateRoomRole = manualPromise()
            useChatsStore.setState({
                updateRoomRole,
            })
            const validate = vi.fn().mockReturnValue(true)
            const onSuccess = vi.fn()
            const controller = mountHook({
                roomRoleId,
                role,
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
            await act(async () => await updateRoomRole.resolve())
            expect(toValue(controller.current.isPending)).toStrictEqual(false)
            expect(updateRoomRole).toHaveBeenCalledWith(roomRoleId, { role })
            expect(onSuccess).toHaveBeenCalled()
        })

        it('should not send update role request if form is not valid', async () => {
            const updateRoomRole = vi.fn().mockResolvedValue()
            useChatsStore.setState({
                updateRoomRole,
            })
            const validate = vi.fn().mockReturnValue(false)
            const onSuccess = vi.fn()
            const controller = mountHook({
                roomRoleId,
                role,
                actions: {
                    validate,
                    onSuccess,
                },
            })
            await act(async () => controller.current.submit())
            expect(validate).toHaveBeenCalled()
            expect(toValue(controller.current.isPending)).toStrictEqual(false)
            expect(updateRoomRole).not.toHaveBeenCalled()
            expect(onSuccess).not.toHaveBeenCalled()
        })

        it('should set isPending to false if update role request fails', async () => {
            const updateRoomRole = manualPromise()
            useChatsStore.setState({
                updateRoomRole,
            })
            const validate = vi.fn().mockReturnValue(true)
            const onSuccess = vi.fn()
            const controller = mountHook({
                roomRoleId,
                role,
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
            await act(async () => await updateRoomRole.reject(new Error('Update failed')))
            expect(toValue(controller.current.isPending)).toStrictEqual(false)
            expect(updateRoomRole).toHaveBeenCalledWith(roomRoleId, { role })
            expect(onSuccess).not.toHaveBeenCalled()
        })
    })
}, {
    constructor: useRoleEdit,
})
