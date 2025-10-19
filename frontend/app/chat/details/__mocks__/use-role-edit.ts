import { afterEach, vi } from 'vitest'


export const isPending = { current: false }
export const errors = { current: {} }
export const submit = vi.fn()
export const validate = vi.fn().mockReturnValue(true)
export const onSuccess = vi.fn()

export const useRoleEdit = vi.fn(() => ({
    isPending: isPending.current,
    errors: errors.current,
    submit,
    validate,
    onSuccess,
}))

afterEach(() => {
    isPending.current = false
    errors.current = {}
})
