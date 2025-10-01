import { describe } from "vitest"
import axios from 'axios'
import { act } from '@testing-library/react'
import { describeStore } from "~/test/unit/storeTest"
import { userFactory } from "~/test/factories/user"
import { accessTokenFactory } from "~/test/factories/accessToken"
import { useAuthStore } from '../auth-store'

vi.mock('axios')

describeStore('auth-store', ({ createStore }) => {
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
            const store = createStore(useAuthStore)
            await act(async () => {
                store.login({
                    email,
                    password,
                })
            })
            expect(axios.post).toHaveBeenCalledWith(
                '/api/auth/login', {
                    email,
                    password,
                },
            )
            expect(useAuthStore.getState().accessToken).toStrictEqual(accessToken)
            expect().fail()
        })

        it('should raise if failed', async() => {
            const store = createStore(useAuthStore)
            const promise = store.login({
                email,
                password,
            })
            expect().fail()
            expect(promise).rejects.toThrow()
        })
    })

    describe('logout', () => {
        it('should fail', () => {
            expect().fail()
        })
    })

    describe('refresh-token', () => {
        it('should fail', () => {
            expect().fail()
        })
    })
})
