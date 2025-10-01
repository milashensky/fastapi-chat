import { render } from '@testing-library/react'
import { describe } from "vitest";

export const describeComponent = (testName, callback) => describe(testName, () => {
    vi.mock('react-router', () => ({
        ...vi.importActual('react-router'),
        useOutletContext: () => ({ language: 'en' })
    }));

    callback({
        render: render,
    })

    afterEach(() => {
        vi.clearAllMocks()
        vi.restoreAllMocks()
    })
})
