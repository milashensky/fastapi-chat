type Key = string | symbol

export const defaultDict = <T>(valueConstructor: () => T) => {
    const dictProxy = new Proxy(
        {} as Record<Key, T>,
        {
            get(target, key) {
                if (!Object.hasOwn(target, key)) {
                    target[key] = valueConstructor()
                }
                return target[key]

            },
            set(target, key, value: T) {
                target[key] = value
                return true
            },
        }
    )
    return dictProxy
}
