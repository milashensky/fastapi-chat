export type FormErrors<T extends Record<string, any>> = {
    [K in keyof T | "__all__"]?: string[]
}
