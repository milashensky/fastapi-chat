import { act } from '@testing-library/react'
import { BadResponseError } from '~/utils/request'
import { toValue } from '~/utils/stateRef'
import { useAuthStore } from '~/auth/auth-store'
import { describeHook } from '~/test/unit/hookTest'
import { manualPromise } from '~/test/unit/manualPromise'
import { useLoginState } from '../use-login-state'

vi.mock('zustand')

describeHook('use-login-state', ({ mountHook }) => {
    const email = 'somebody-once@told.me'
    const password = 'the-world-is_gonna_roll_me'

    describe('submit', () => {
        it('should send login request if form is valid', async () => {
            const login = manualPromise()
            useAuthStore.setState({
                login,
            })
            const validate = vi.fn().mockReturnValue(true)
            const controller = mountHook({
                email,
                password,
                actions: {
                    validate,
                },
            })
            await act(async () => {
                controller.current.submit()
            })
            expect(validate).toHaveBeenCalled()
            expect(toValue(controller.current.isPending)).toStrictEqual(true)
            await act(async () => await login.resolve())
            expect(toValue(controller.current.isPending)).toStrictEqual(false)
            expect(login).toHaveBeenCalledWith({
                email,
                password,
            })
        })

        it('should send not send login request if form is not valid', async () => {
            const login = vi.fn().mockResolvedValue()
            useAuthStore.setState({
                login,
            })
            const validate = vi.fn().mockReturnValue(false)
            const controller = mountHook({
                email,
                password,
                actions: {
                    validate,
                },
            })
            await act(async () => controller.current.submit())
            expect(validate).toHaveBeenCalled()
            expect(toValue(controller.current.isPending)).toStrictEqual(false)
            expect(login).not.toHaveBeenCalled()
        })

        it('should return errors if login request fails', async () => {
            const errors = {
                email: ['somebody once told me'],
            }
            const login = manualPromise()
            useAuthStore.setState({
                login,
            })
            const validate = vi.fn().mockReturnValue(true)
            const controller = mountHook({
                email,
                password,
                actions: {
                    validate,
                },
            })
            await act(async () => {
                controller.current.submit()
            })
            expect(validate).toHaveBeenCalled()
            expect(toValue(controller.current.isPending)).toStrictEqual(true)
            await act(async () => await login.reject(new BadResponseError({ data: errors })))
            expect(toValue(controller.current.isPending)).toStrictEqual(false)
            expect(login).toHaveBeenCalledWith({
                email,
                password,
            })
            expect(toValue(controller.current.errors)).toStrictEqual(errors)
        })
    })
}, {
    constructor: useLoginState,
})
