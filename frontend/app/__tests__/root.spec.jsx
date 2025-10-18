import { useAuthStore } from '~/auth/auth-store'
import { describeComponent } from '~/test/unit/componentTest'
import { accessTokenFactory } from '~/test/factories/accessToken'
import App from '../root'


vi.mock('zustand')

describeComponent('App', ({ render }) => {
    beforeEach(() => {
        vi.useFakeTimers().setSystemTime(new Date('2025-12-12T12:00:00Z'))
    })

    describe('token refresh', () => {
        it('should refresh token on mount if expiry is soon', () => {
            const refreshAccessToken = vi.fn()
            useAuthStore.setState({
                accessToken: accessTokenFactory({
                    'expires_at': new Date('2025-12-12T12:00:30Z') / 1000,
                }),
                refreshAccessToken,
            })
            render(<App/>)
            expect(refreshAccessToken).toHaveBeenCalled()
        })

        it('should refresh token before expiry', () => {
            const refreshAccessToken = vi.fn()
            useAuthStore.setState({
                accessToken: accessTokenFactory({
                    'expires_at': new Date('2025-12-12T14:00:30Z') / 1000,
                }),
                refreshAccessToken,
            })
            render(<App/>)
            expect(refreshAccessToken).not.toHaveBeenCalled()
            vi.advanceTimersByTime(2 * 60 * 60 * 1000)
            expect(refreshAccessToken).toHaveBeenCalled()
        })

        it('should clean refresh timeout on unmount', () => {
            const refreshAccessToken = vi.fn()
            useAuthStore.setState({
                accessToken: accessTokenFactory({
                    'expires_at': new Date('2025-12-12T14:00:30Z') / 1000,
                }),
                refreshAccessToken,
            })
            const component = render(<App/>)
            expect(refreshAccessToken).not.toHaveBeenCalled()
            component.unmount()
            vi.advanceTimersByTime(3 * 60 * 60 * 1000)
            expect(refreshAccessToken).not.toHaveBeenCalled()
        })
    })
})
