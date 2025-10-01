import { useState } from "react"

export interface StateRef<T> {
    current: T
}

export type MaybeRef<T> = StateRef<T> | T

export const useStateRef = <T>(initialValue: T): StateRef<T> => {
    const [stateValue, setState] = useState<T>(initialValue)
    return new Proxy(
        {
            current: stateValue,
        },
        {
            get: () => stateValue,
            set (obj, prop, newValue: T) {
                setState(newValue)
                return true
            },
        },
    )
}
