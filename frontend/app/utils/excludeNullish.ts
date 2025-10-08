export const excludeNullish = <T>(value: T | null | undefined): value is T => {
    if (value === null) {
        return false
    }
    if (value === undefined) {
        return false
    }
    return true
}
