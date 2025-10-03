import { act } from '@testing-library/react'
import { describeComponent } from '~/test/unit/componentTest'
import UnauthenticatedLayout from '../unauthenticated-layout'
import { useAuthStore } from '../auth-store'
import { DEFAULT_PAGE } from '~/utils/constants'

vi.mock('zustand')

describeComponent('UnauthenticatedLayout', ({ render, reactRouter }) => {
    const navigateMock = vi.fn()

    beforeEach(() => {
        vi.spyOn(reactRouter, 'useNavigate').mockReturnValue(navigateMock)
    })

    it('should render content if user is unauthenticated', () => {
        useAuthStore.setState({ userId: null })
        render(<UnauthenticatedLayout />)
        expect(navigateMock).not.toHaveBeenCalled()
    })

    it('should redirect to next if user is authenticated', async () => {
        useAuthStore.setState({ userId: 0 })
        render(<UnauthenticatedLayout />)
        expect(navigateMock).toHaveBeenCalledWith(DEFAULT_PAGE, { replace: true })
    })

    it('should support next query param', async () => {
        const next = '/somebody/once/told/me'
        const url = new URL(`http://localhost/?next=${next}`);
         Object.defineProperty(window, "location", {
            writable: true,
            value: {
                ...window.location,
                search: url.search,
            },
        });
        useAuthStore.setState({ userId: 0 })
        render(<UnauthenticatedLayout />)
        expect(navigateMock).toHaveBeenCalledWith(next, { replace: true })
    })

    it('should redirect to next if user state changes', () => {
        useAuthStore.setState({ userId: null })
        render(<UnauthenticatedLayout />)
        expect(navigateMock).not.toHaveBeenCalled()
        act(() => {
            useAuthStore.setState({ userId: 0 })
        })
        expect(navigateMock).toHaveBeenCalled()
    })
})
