type Mappable<Key extends string | number> = object & {
    [K in Key]: string | number
}

export const toMap = <Key extends string | number, T extends Mappable<Key>>(array: T[], key: Key) => {
    const map = array.reduce((mapped, item) => {
        return {
            ...mapped,
            [item[key]]: item,
        }
    }, {} as Record<string | number, T>)
    return map
}
