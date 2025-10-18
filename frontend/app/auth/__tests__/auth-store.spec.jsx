import { describe } from 'vitest'
import axios from 'axios'
import { userFactory } from '~/test/factories/user'
import { accessTokenFactory } from '~/test/factories/accessToken'
import { useAuthStore } from '../auth-store'
import { useUserStore } from '../user-store'


vi.mock('axios')

describe('auth-store', () => {
    describe('login', () => {
        const email = 'somebody-once@told.me'
        const password = 'the world is gonna roll me'

        it('should make correct request and set user and token', async() => {
            const user = userFactory()
            const accessToken = accessTokenFactory()
            axios.post.mockResolvedValue({
                data: {
                    user,
                    access_token: accessToken,
                },
            })
            const store = useAuthStore.getState()
            await store.login({
                email,
                password,
            })
            expect(axios.post).toHaveBeenCalledWith(
                '/api/auth/login', {
                    email,
                    password,
                },
            )
            expect(useAuthStore.getState().accessToken).toStrictEqual(accessToken)
            expect(useAuthStore.getState().userId).toStrictEqual(user.id)
            expect(useUserStore.getState().users[user.id]).toStrictEqual(user)
        })

        it('should raise if failed', async() => {
            const error = 'testError'
            axios.post.mockRejectedValue(error)
            const store = useAuthStore.getState()
            const promise = store.login({
                email,
                password,
            })
            await expect(promise).rejects.toThrow(error)
        })
    })

    describe('registerUser', () => {
        const name = 'shrek'
        const email = 'somebody-once@told.me'
        const password = 'the world is gonna roll me'

        it('should make correct request and set user and token', async() => {
            const user = userFactory()
            const accessToken = accessTokenFactory()
            axios.post.mockResolvedValue({
                data: {
                    user,
                    access_token: accessToken,
                },
            })
            const store = useAuthStore.getState()
            await store.registerUser({
                email,
                name,
                password,
            })
            expect(axios.post).toHaveBeenCalledWith(
                '/api/auth/registration', {
                    email,
                    name,
                    password,
                },
            )
            expect(useAuthStore.getState().accessToken).toStrictEqual(accessToken)
            expect(useAuthStore.getState().userId).toStrictEqual(user.id)
            expect(useUserStore.getState().users[user.id]).toStrictEqual(user)
        })
    })

    describe('logout', () => {
        it('should reset access token and user', async () => {
            const store = useAuthStore.getState()
            useAuthStore.setState({
                userId: 0,
                accessToken: accessTokenFactory(),
            })
            await store.logout()
            expect(useAuthStore.getState().accessToken).toStrictEqual(null)
            expect(useAuthStore.getState().userId).toStrictEqual(null)
        })
    })

    describe('refreshAccessToken', () => {
        it('should send post request and refresh current token', async () => {
            const store = useAuthStore.getState()
            const refreshedToken = accessTokenFactory()
            axios.post.mockResolvedValue({
                data: refreshedToken,
            })
            useAuthStore.setState({
                accessToken: accessTokenFactory(),
            })
            await store.refreshAccessToken()
            expect(axios.post).toHaveBeenCalledWith('/api/auth/token')
            expect(useAuthStore.getState().accessToken).toStrictEqual(refreshedToken)
        })
    })

    describe('fetchCurrentUser', () => {
        it('should make correct request and set user and token', async() => {
            const user = userFactory()
            const accessToken = accessTokenFactory()
            axios.get.mockResolvedValue({
                data: {
                    user,
                    access_token: accessToken,
                },
            })
            const store = useAuthStore.getState()
            await store.fetchCurrentUser()
            expect(axios.get).toHaveBeenCalledWith('/api/auth/me')
            expect(useAuthStore.getState().accessToken).toStrictEqual(accessToken)
            expect(useAuthStore.getState().userId).toStrictEqual(user.id)
            expect(useUserStore.getState().users[user.id]).toStrictEqual(user)
        })
    })
})
