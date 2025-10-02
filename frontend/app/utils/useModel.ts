import axios from "axios"

type Pk = string | number

interface ModelOptions<Item extends unknown, ItemPk = Pk>{
    baseUrl: string,
    storeItem: (pk: ItemPk, item: Item | null) => void
    deleteItem: (pk: ItemPk) => void
    getItemPk?: (item: Item) => ItemPk
    getItem?: (pk: ItemPk) => Item | null | undefined
    getListUrl?: () => string
    getItemUrl?: (pk: ItemPk) => string
}

interface RequestConfig<Item extends unknown, Response extends unknown> {
    handleResponse?: (responseData: Response) => void
}

interface ItemRequestConfig<
    Item extends unknown,
    ItemResponse extends unknown,
> extends RequestConfig<Item, ItemResponse> {
    extractItem?: (responseData: ItemResponse) => Item
}

interface ListConfig<
    Item extends unknown,
    ListResponse extends unknown,
    Filters extends unknown,
> extends RequestConfig<Item, ListResponse> {
    filters?: Filters,
    extractItems?: (responseData: ListResponse) => Item[]
}

export class ModelSetupError extends Error {
    constructor(message: string) {
        super(message)
        this.name = this.constructor.name
    }
}

export const useModel = <
    Item,
    ItemPk = Pk,
    ListFilters = unknown,
    ListResponse = Item[],
    FetchResponse = Item,
    CreateItemBody = Omit<Item, 'id'>,
    CreateResponse = Item,
    UpdateItemBody = Partial<Item>,
    UpdateResponse = Item,
    DeleteResponse = null,
>(options: ModelOptions<Item, ItemPk>) => {
    const {
        getItemPk = (item: Item) => (item as Item & {id: ItemPk}).id,
        storeItem,
        getItem,
        deleteItem,
    } = options
    const getItemUrl = (itemPk: ItemPk): string => {
        if (options.getItemUrl) {
            return options.getItemUrl(itemPk)
        }
        return `${options.baseUrl}/${itemPk}`
    }
    const getListUrl = () => {
        if (options.getListUrl) {
            return options.getListUrl()
        }
        return options.baseUrl
    }
    const actions = {
        async list(config: ListConfig<Item, ListResponse, ListFilters> = {}) {
            const {
                filters,
                extractItems = (responseData) => responseData as Item[],
                handleResponse = (responseData) => {
                    const items = extractItems(responseData)
                    items.forEach((item) => storeItem(getItemPk(item), item))
                },
            } = config
            const url = getListUrl()
            const response = await axios.get<ListResponse>(url, {
                params: filters,
            })
            const responseData = response.data
            handleResponse(responseData)
            return responseData
        },
        async fetch(itemPk: ItemPk, config: ItemRequestConfig<Item, FetchResponse> = {}) {
            const {
                extractItem = (responseData) => responseData as unknown as Item,
                handleResponse = (responseData) => {
                    const item = extractItem(responseData)
                    storeItem(itemPk, item)
                },
            } = config
            const url = getItemUrl(itemPk)
            const response = await axios.get<FetchResponse>(url)
            const responseData = response.data
            handleResponse(responseData)
            return responseData
        },
        getOrFetch(itemPk: ItemPk) {
            if (!getItem) {
                throw new ModelSetupError('no getItem is provided')
            }
            const storedItem = getItem(itemPk)
            if (storedItem === undefined) {
                storeItem(itemPk, null)
                this.fetch(itemPk)
            }
            return storedItem
        },
        async create(itemBody: CreateItemBody, config: ItemRequestConfig<Item, CreateResponse> = {}) {
            const {
                extractItem = (responseData) => responseData as unknown as Item,
                handleResponse = (responseData) => {
                    const item = extractItem(responseData)
                    storeItem(getItemPk(item), item)
                },
            } = config
            const url = getListUrl()
            const response = await axios.post<CreateResponse>(url, itemBody)
            const responseData = response.data
            handleResponse(responseData)
            return responseData
        },
        async update(itemPk: ItemPk, itemBody: UpdateItemBody, config: ItemRequestConfig<Item, UpdateResponse> = {}) {
            const {
                extractItem = (responseData) => responseData as unknown as Item,
                handleResponse = (responseData) => {
                    const item = extractItem(responseData)
                    storeItem(itemPk, item)
                },
            } = config
            const url = getItemUrl(itemPk)
            const response = await axios.patch<UpdateResponse>(url, itemBody)
            const responseData = response.data
            handleResponse(responseData)
            return responseData
        },
        async delete(itemPk: ItemPk, config: RequestConfig<Item, DeleteResponse> = {}) {
            const {
                handleResponse = () => {
                    deleteItem(itemPk)
                },
            } = config
            const url = getItemUrl(itemPk)
            const response = await axios.delete<DeleteResponse>(url)
            const responseData = response.data
            handleResponse(responseData)
            return responseData
        },
    }
    return actions
}
