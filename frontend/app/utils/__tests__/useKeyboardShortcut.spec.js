import { act, fireEvent } from '@testing-library/react'
import { describeHook } from '~/test/unit/hookTest'
import { useKeyboardShortcut } from '../useKeyboardShortcut'


describeHook('useKeyboardShortcut', ({ mountHook }) => {
    it('should trigger callback if shortcut is pressed', () => {
        const callback = vi.fn()
        mountHook({
            shortcut: 'a',
            callback
        })
        expect(callback).not.toHaveBeenCalled()
        act(() => {
            fireEvent.keyDown(window, {
                key: 'a',
                code: 'KeyA',
                keyCode: 65,
                charCode: 65,
            })
        })
        expect(callback).toHaveBeenCalled()
    })

    it('should handle keyboard combinations', () => {
        const callback = vi.fn()
        mountHook({
            shortcut: 'ctrl + a',
            callback
        })
        expect(callback).not.toHaveBeenCalled()
        act(() => {
            fireEvent.keyDown(window, {
                key: 'a',
                code: 'KeyA',
                keyCode: 65,
                charCode: 65,
            })
            fireEvent.keyDown(window, {
                key: 'Control',
                code: 'ControlLeft',
                keyCode: 17,
                charCode: 17,
            })
        })
        expect(callback).toHaveBeenCalled()
    })

    it('should not trigger callback if wrong shortcut is pressed', () => {
        const callback = vi.fn()
        mountHook({
            shortcut: 'ctrl + a',
            callback
        })
        act(() => {
            fireEvent.keyDown(window, {
                key: 'a',
                code: 'KeyA',
                keyCode: 65,
                charCode: 65,
            })
            fireEvent.keyDown(window, {
                key: 'Alt',
                code: 'KeyAlt',
                keyCode: 18,
                charCode: 18,
            })
            fireEvent.keyDown(window, {
                key: 'ControlLeft',
                code: 'Control',
                keyCode: 17,
                charCode: 17,
            })
        })
        expect(callback).not.toHaveBeenCalled()
    })

    it('should not trigger callback key was released', () => {
        const callback = vi.fn()
        mountHook({
            shortcut: 'ctrl + a',
            callback
        })
        act(() => {
            fireEvent.keyDown(window, {
                key: 'a',
                code: 'KeyA',
                keyCode: 65,
                charCode: 65,
            })
            fireEvent.keyUp(window, {
                key: 'a',
                code: 'KeyA',
                keyCode: 65,
                charCode: 65,
            })
            fireEvent.keyDown(window, {
                key: 'ControlLeft',
                code: 'Control',
                keyCode: 17,
                charCode: 17,
            })
        })
        expect(callback).not.toHaveBeenCalled()
    })

    it('should not trigger callback after unmount', () => {
        const callback = vi.fn()
        const hook = mountHook({
            shortcut: 'a',
            callback
        })
        hook.unmount()
        act(() => {
            fireEvent.keyDown(window, {
                key: 'a',
                code: 'KeyA',
                keyCode: 65,
                charCode: 65,
            })
        })
        expect(callback).not.toHaveBeenCalled()
    })
}, {
    constructor: useKeyboardShortcut,
})
