import { act } from '@testing-library/react'
import { describeComponent } from '~/test/unit/componentTest'
import AuthRequiredLayout from '../auth-required-layout'
import { useAuthStore } from '../auth-store'

vi.mock('zustand')

describeComponent('AuthRequiredLayout', ({ render, reactRouter }) => {
    const navigateMock = vi.fn()

    beforeEach(() => {
        vi.spyOn(reactRouter, 'useNavigate').mockReturnValue(navigateMock)
    })

    it('should render content if user is unauthenticated', () => {
        useAuthStore.setState({ userId: 0 })
        render(<AuthRequiredLayout />)
        expect(navigateMock).not.toHaveBeenCalled()
    })

    it('should redirect to login if user is not unauthenticated', async () => {
        useAuthStore.setState({ userId: null })
        render(<AuthRequiredLayout />)
        expect(navigateMock).toHaveBeenCalledWith(expect.stringContaining('/login'))
    })

    it('should redirect to login if user state changes', () => {
        useAuthStore.setState({ userId: 0 })
        render(<AuthRequiredLayout />)
        expect(navigateMock).not.toHaveBeenCalled()
        act(() => {
            useAuthStore.setState({ userId: null })
        })
        expect(navigateMock).toHaveBeenCalledWith(expect.stringContaining('/login'))
    })
})
