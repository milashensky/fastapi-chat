import { useState } from "react"

export interface StateRef<T> {
    current: T
}

export type MaybeRef<T> = StateRef<T> | T

const getProxyHandler = <T, Key extends keyof T & string>(setter: (value: T) => void) => ({
    get(target: T, key: Key): unknown {
        const prop = target[key]
        if (typeof prop === 'object' && prop !== null) {
            type PropType = typeof prop
            const update = (value: PropType) => {
                const updated = {
                    ...target,
                    [key]: value,
                } as T
                setter(updated)
            }
            return new Proxy(prop, getProxyHandler(update))
        }
        return prop
    },
    set(target: T, key: Key, value: T[Key]) {
        const updated = {
            ...target,
            [key]: value,
        }
        setter(updated)
        return true
    }
})

export const useStateRef = <T>(initialValue: T): StateRef<T> => {
    const [stateValue, setState] = useState<T>(initialValue)
    return new Proxy(
        {
            current: stateValue,
        },
        {
            get: <R extends StateRef<T>>(target: R, key: keyof R) => {
                if (typeof stateValue !== 'object') {
                    return stateValue
                }
                if (stateValue === null) {
                    return stateValue
                }
                return new Proxy(
                    stateValue,
                    getProxyHandler((updated) => {
                        setState(updated as T)
                    }),
                )
            },
            set (obj, prop, newValue: T) {
                setState(newValue)
                return true
            },
        },
    )
}
