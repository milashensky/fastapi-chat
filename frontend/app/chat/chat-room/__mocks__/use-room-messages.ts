import { afterEach, vi } from 'vitest'


export const fetchNext = vi.fn()
export const canFetchNext = { current: true }
export const isLoading = { current: false }
export const messages = { current: [] }

export const useRoomMessages = vi.fn(() => {
    return {
        fetchNext,
        canFetchNext: canFetchNext.current,
        isLoading: isLoading.current,
        messages: messages.current,
    }
})

afterEach(() => {
    canFetchNext.current = true
    isLoading.current = false
    messages.current = []
})
