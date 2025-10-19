import {
    useEffect,
    useRef,
} from 'react'


interface Options {
    timeout?: number
    callback: () => unknown
}

export const useDebounced = (options: Options) => {
    const {
        timeout = 300,
    } = options
    const timeoutRef = useRef<NodeJS.Timeout>(null)
    const debouncedAction = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
            options.callback()
        }, timeout)
    }
    useEffect(() => {
        return () => {
            if (timeoutRef.current === null) {
                return
            }
            clearTimeout(timeoutRef.current)
        }
    }, [])
    return debouncedAction
}
