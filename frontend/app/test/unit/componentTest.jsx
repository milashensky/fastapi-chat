/* eslint-disable vitest/valid-title */
import { render } from '@testing-library/react'
import { describe } from 'vitest'
import * as reactRouter from 'react-router'


vi.mock('axios')
vi.mock('zustand')

export const describeComponent = (testName, callback) => describe(testName, () => {
    vi.mock('~/ui-kit/dialog', () => ({
        default: (props) => (
            <div data-stub="dialog">
                {props.children}
            </div>
        )
    }))

    vi.mock('~/ui-kit/intersection', () => ({
        default: () => (
            <div data-stub="intersection" />
        )
    }))

    vi.mock('react-router', async (importOriginal) => {
        const original = await importOriginal()
        return {
            ...original,
            useOutletContext: () => ({ language: 'en' }),
            useNavigate: () => vi.fn(),
        }
    })

    callback({
        render(component, ...args) {
            return render(
                (
                    <reactRouter.StaticRouter location={window.location}>
                        {component}
                    </reactRouter.StaticRouter>
                ),
                ...args,
            )
        },
        reactRouter,
    })

    afterEach(() => {
        vi.clearAllMocks()
        vi.restoreAllMocks()
    })
})
