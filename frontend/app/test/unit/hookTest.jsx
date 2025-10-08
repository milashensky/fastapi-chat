import { renderHook } from '@testing-library/react'
import { describe } from 'vitest'

export const describeHook = (testName, callback, { constructor, defaults = {} }) => describe(testName, (options) => {
    const mountHook = (overrides = {}) => {
        const {
            result,
            rerender,
            unmount,
        } = renderHook(() => constructor({
            ...defaults,
            ...overrides,
        }))
        const renderedHook = new Proxy(
            {},
            {
                get(target, property) {
                    if (property === 'rerender') {
                        return rerender
                    }
                    if (property === 'unmount') {
                        return unmount
                    }
                    return result[property]
                },
            },
        )
        return renderedHook
    }

    callback({
        ...options,
        mountHook,
    })
})
