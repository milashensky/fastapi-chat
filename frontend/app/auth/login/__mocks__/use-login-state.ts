import { afterEach, vi } from 'vitest'


export const validate = vi.fn()
export const submit = vi.fn()

export const isPending = { current: false }
export const errors = { current: {} }

export const useLoginState = vi.fn(() => {
    return {
        isPending,
        errors,
        validate,
        submit,
    }
})

afterEach(() => {
    isPending.current = false
    errors.current = {}
})
