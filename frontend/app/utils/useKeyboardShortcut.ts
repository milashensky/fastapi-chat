import {
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
        const isPressed = cleanedPressed.every((key) => cleanedShortcut.includes(key))
        return isPressed
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
    const handleBlur = () => {
        pressedKeys.current = []
    }
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        window.addEventListener('blur', handleBlur)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            window.removeEventListener('blur', handleBlur)
        }
    }, [handleKeyDown])
}
