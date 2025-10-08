export type FormErrors<T extends Record<string, any>> = {
    [K in keyof T | "__all__"]?: string[]
}

export type BaseModelTable<K extends string | number, T> = Record<K, T | null>

export type IdModelTable<Model extends {id: string | number}> = BaseModelTable<Model['id'], Model>

export interface PaginatedResponse<Item> {
    total: number
    page: number
    page_size: number
    results: Item[]
    next: number | null
}

export type Override<TBase, TOverride> = Omit<TBase, keyof TOverride> & TOverride

export type GenericProps = Partial<{
    [key: `data-${string}`]: string
}>

export interface PaginationFilters {
    page?: number
    page_size?: number
}

export interface SearchFilters {
    search?: string
}
