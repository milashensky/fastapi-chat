import { renderHook } from '@testing-library/react'
import { describe } from 'vitest'

export const describeHook = (testName, callback, { constructor, defaults = {} }) => describe(testName, (options) => {
    const mountHook = (overrides = {}) => {
        const { result } = renderHook(() => constructor({
            ...defaults,
            ...overrides,
        }))
        return result
    }

    callback({
        ...options,
        mountHook,
    })
})
