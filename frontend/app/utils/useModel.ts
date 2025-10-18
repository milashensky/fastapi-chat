import axios from 'axios'


type Pk = string | number

type RequestOptions = Record<string, unknown>

interface ModelOptions<Item, ItemPk = Pk>{
    baseUrl: string,
    storeItem: (pk: ItemPk, item: Item | null) => void
    deleteItem: (pk: ItemPk) => void
    getItemPk?: (item: Item) => ItemPk
    getItem?: (pk: ItemPk) => Item | null | undefined
    getListUrl?: (options: RequestOptions) => string
    getItemUrl?: (pk: ItemPk, options: RequestOptions) => string
}

interface ItemRequestConfig<
    Item,
    ItemResponse,
> extends RequestConfig<ItemResponse> {
    extractItem?: (responseData: ItemResponse) => Item
}

export interface RequestConfig<Response> extends RequestOptions {
    handleResponse?: (responseData: Response) => void
}

export interface ListConfig<
    Item,
    ListResponse,
    Filters,
> extends RequestConfig<ListResponse> {
    filters?: Filters,
    extractItems?: (responseData: ListResponse) => Item[]
}

export class ModelSetupError extends Error {
    constructor(message: string) {
        super(message)
        this.name = this.constructor.name
    }
}

interface DefaultDefenition {
    ItemPk: Pk
    ListFilters: unknown,
    ListResponse: unknown,
    FetchResponse: unknown,
    CreateItemBody: unknown,
    CreateResponse: unknown,
    UpdateItemBody: unknown,
    UpdateResponse: unknown,
    DeleteResponse: unknown,
}

export interface ModelDefenition<Item>{
    ItemPk: Pk
    ListFilters: unknown,
    ListResponse: Item[],
    FetchResponse: Item,
    CreateItemBody: Omit<Item, 'id'>,
    CreateResponse: Item,
    UpdateItemBody: Partial<Item>,
    UpdateResponse: Item,
    DeleteResponse: null,
}

export const useModel = <
    Item,
    Defenitions extends DefaultDefenition = ModelDefenition<Item>,
>(options: ModelOptions<Item, Defenitions['ItemPk']>) => {
    type ItemPk = Defenitions['ItemPk']
    type ListFilters = Defenitions['ListFilters']
    type ListResponse = Defenitions['ListResponse']
    type FetchResponse = Defenitions['FetchResponse']
    type CreateItemBody = Defenitions['CreateItemBody']
    type CreateResponse = Defenitions['CreateResponse']
    type UpdateItemBody = Defenitions['UpdateItemBody']
    type UpdateResponse = Defenitions['UpdateResponse']
    type DeleteResponse = Defenitions['DeleteResponse']
    const {
        getItemPk = (item: Item) => (item as Item & {id: ItemPk}).id,
        storeItem,
        getItem,
        deleteItem,
    } = options
    const getItemUrl = (itemPk: ItemPk, requestOptions: RequestOptions): string => {
        if (options.getItemUrl) {
            return options.getItemUrl(itemPk, requestOptions)
        }
        return `${options.baseUrl}/${itemPk}`
    }
    const getListUrl = (requestOptions: RequestOptions) => {
        if (options.getListUrl) {
            return options.getListUrl(requestOptions)
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
            const url = getListUrl(config)
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
            const url = getItemUrl(itemPk, config)
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
                actions.fetch(itemPk)
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
            const url = getListUrl(config)
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
            const url = getItemUrl(itemPk, config)
            const response = await axios.patch<UpdateResponse>(url, itemBody)
            const responseData = response.data
            handleResponse(responseData)
            return responseData
        },
        async delete(itemPk: ItemPk, config: RequestConfig<DeleteResponse> = {}) {
            const {
                handleResponse = () => {
                    deleteItem(itemPk)
                },
            } = config
            const url = getItemUrl(itemPk, config)
            const response = await axios.delete<DeleteResponse>(url)
            const responseData = response.data
            handleResponse(responseData)
            return responseData
        },
    }
    return actions
}
