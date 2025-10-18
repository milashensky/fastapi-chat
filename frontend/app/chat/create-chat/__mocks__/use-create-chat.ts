import { afterEach, vi } from 'vitest'


export const validate = vi.fn()
export const onSuccess = vi.fn()
export const submit = vi.fn()

export const errors = { current: {} }
export const isPending = { current: false }

export const useCreateChat = vi.fn(() => {
    return {
        errors: errors.current,
        isPending: isPending.current,
        validate,
        onSuccess,
        submit,
    }
})

afterEach(() => {
    isPending.current = false
    errors.current = {}
})
