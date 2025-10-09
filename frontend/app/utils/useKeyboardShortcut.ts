import {
    useCallback,
    useEffect,
    useRef,
} from 'react'

interface Options {
    shortcut: string
    callback: () => unknown
}

export const useKeyboardShortcut = (options: Options) => {
    const pressedKeys = useRef<string[]>([])
    const cleanKey = (rawKey: string) => {
        if (rawKey === ' ') {
            return 'space'
        }
        const key = rawKey.trim().toLowerCase()
        switch (key) {
            case 'ctrl':
                return 'control'
            default:
                return key
        }
    }
    const checkShortcutPressed = (): boolean => {
        const cleanedShortcut = options.shortcut.split('+').map(cleanKey)
        const cleanedPressed = pressedKeys.current.map(cleanKey)
        if (cleanedPressed.length !== cleanedShortcut.length) {
            return false
        }
        return cleanedPressed.every((key) => cleanedShortcut.includes(key))
    }
    const handleKeyDown = (event: KeyboardEvent) => {
        pressedKeys.current.push(event.key)
        if (checkShortcutPressed()) {
            return options.callback()
        }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
        pressedKeys.current = pressedKeys.current.filter((key) => key !== event.key)
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.addEventListener('keyup', handleKeyUp)
        }
    }, [handleKeyDown])
}
