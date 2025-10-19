import { act } from '@testing-library/react'
import { describeHook } from '~/test/unit/hookTest'
import { useDebounced } from '../useDebounced'


describeHook('useDebounced', ({ mountHook }) => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    const timeout = 300
    const callback = vi.fn()

    it('should trigger callback after timeout', () => {
        const hook = mountHook({
            timeout,
            callback,
        })
        act(() => {
            hook.current()
        })
        expect(callback).not.toHaveBeenCalled()
        act(() => {
            vi.advanceTimersByTime(timeout)
        })
        expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should reset timeout on sequential calls', () => {
        const hook = mountHook({
            timeout,
            callback,
        })
        act(() => {
            hook.current()
        })
        expect(callback).not.toHaveBeenCalled()
        act(() => {
            vi.advanceTimersByTime(timeout - 1)
        })
        expect(callback).not.toHaveBeenCalled()
        act(() => {
            hook.current()
        })
        act(() => {
            vi.advanceTimersByTime(timeout)
        })
        expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should clear timeout on unmount', () => {
        const hook = mountHook({
            timeout,
            callback,
        })
        act(() => {
            hook.current()
        })
        expect(callback).not.toHaveBeenCalled()
        hook.unmount()
        act(() => {
            vi.advanceTimersByTime(timeout)
        })
        expect(callback).not.toHaveBeenCalled()
    })
}, {
    constructor: useDebounced,
})
