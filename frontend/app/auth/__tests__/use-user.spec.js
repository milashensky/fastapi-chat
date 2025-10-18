import { useUserStore } from '~/auth/user-store'
import { userFactory } from '~/test/factories/user'
import { describeHook } from '~/test/unit/hookTest'
import { DELETED_USER } from '~/utils/constants'

import { useUser } from '../use-user'


describeHook('useUser', ({ mountHook }) => {
    const user = userFactory()

    it('should fetch or get user from store', () => {
        const getOrFetch = vi.fn()
        useUserStore.setState({
            users: {},
            getOrFetch,
        })
        const hook = mountHook({ userId: user.id })
        expect(getOrFetch).toHaveBeenCalledWith(user.id)
        expect(hook.current).toStrictEqual(null)
    })

    it('should return stored user if valid user id', () => {
        const getOrFetch = vi.fn().mockReturnValue(user)
        useUserStore.setState({
            users: {
                [user.id]: user,
            },
            getOrFetch,
        })
        const hook = mountHook({ userId: user.id })
        expect(getOrFetch).toHaveBeenCalledWith(user.id)
        expect(hook.current).toStrictEqual(user)
    })

    it('should return deleted user if userId is null', () => {
        const getOrFetch = vi.fn().mockReturnValue(user)
        useUserStore.setState({
            users: {
                [user.id]: user,
            },
            getOrFetch,
        })
        const hook = mountHook({ userId: null })
        expect(getOrFetch).not.toHaveBeenCalled()
        expect(hook.current).toStrictEqual(DELETED_USER)
    })
}, {
    constructor: useUser,
})
