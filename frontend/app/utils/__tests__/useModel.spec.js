import axios from 'axios'
import { userFactory } from '~/test/factories/user'
import { useModel } from '../useModel'


vi.mock('axios')

describe('useModel', () => {
    const baseUrl = '/api/model'
    const storeItemMock = vi.fn()
    const deleteItemMock = vi.fn()

    const initModel = (overrides = {}) => {
        const model = useModel({
            baseUrl,
            storeItem: storeItemMock,
            deleteItem: deleteItemMock,
            ...overrides,
        })
        return model
    }

    describe('list', () => {
        const item1 = userFactory()
        const item2 = userFactory()

        it('should send get request to a correct url, store items and return value', async() => {
            axios.get.mockResolvedValue({
                data: [
                    item1,
                    item2,
                ],
            })
            const model = initModel()
            const result = await model.list()
            expect(axios.get).toHaveBeenCalledWith(baseUrl, {})
            expect(result).toStrictEqual([
                item1,
                item2,
            ])
            expect(storeItemMock).toHaveBeenCalledWith(item1.id, item1)
            expect(storeItemMock).toHaveBeenCalledWith(item2.id, item2)
        })

        it('should use url getter if provided', async() => {
            axios.get.mockResolvedValue({
                data: [
                    item1,
                    item2,
                ],
            })
            const url = '/custom/url'
            const model = initModel({
                getListUrl: () => url,
            })
            const result = await model.list()
            expect(axios.get).toHaveBeenCalledWith(url, {})
            expect(result).toStrictEqual([
                item1,
                item2,
            ])
            expect(storeItemMock).toHaveBeenCalledWith(item1.id, item1)
            expect(storeItemMock).toHaveBeenCalledWith(item2.id, item2)
        })

        it('should support pagination and filters', async() => {
            const response = {
                results: [
                    item1,
                    item2,
                ],
            }
            axios.get.mockResolvedValue({
                data: response,
            })
            const model = initModel()
            const filters = {
                somebody: 'somebody once told me',
                world: 'gonna roll me',
                page: 2,
            }
            const result = await model.list({
                filters,
                extractItems: (resp) => resp.results,
            })
            expect(axios.get).toHaveBeenCalledWith(baseUrl, { params: filters })
            expect(result).toStrictEqual(response)
            expect(storeItemMock).toHaveBeenCalledWith(item1.id, item1)
            expect(storeItemMock).toHaveBeenCalledWith(item2.id, item2)
        })
    })

    describe('fetch', () => {
        const item = userFactory()

        it('should send get request to a correct url, store item and return value', async() => {
            axios.get.mockResolvedValue({
                data: item,
            })
            const model = initModel()
            const result = await model.fetch(item.id)
            expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/${item.id}`)
            expect(result).toStrictEqual(item)
            expect(storeItemMock).toHaveBeenCalledWith(item.id, item)
        })

        it('should support custom item extractor', async() => {
            const response = { item }
            axios.get.mockResolvedValue({
                data: response,
            })
            const model = initModel()
            const result = await model.fetch(item.id, {
                extractItem: ({ item }) => item
            })
            expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/${item.id}`)
            expect(result).toStrictEqual(response)
            expect(storeItemMock).toHaveBeenCalledWith(item.id, item)
        })

        it('should support custom url formatter', async() => {
            axios.get.mockResolvedValue({
                data: item,
            })
            const model = initModel({
                getItemUrl: (id) => `custom/url/${id}`
            })
            await model.fetch(item.id)
            expect(axios.get).toHaveBeenCalledWith(`custom/url/${item.id}`)
        })
    })

    describe('getOrFetch', () => {
        const getItemMock = vi.fn()
        const item = userFactory()

        it('should send fetch if not stored yet', () => {
            getItemMock.mockReturnValue(undefined)
            const model = initModel({
                getItem: getItemMock,
            })
            const fetchSpy = vi.spyOn(model, 'fetch').mockResolvedValue(item)
            const result = model.getOrFetch(item.id)
            expect(fetchSpy).toHaveBeenCalledWith(item.id)
            expect(result).toBeFalsy()
            expect(storeItemMock).toHaveBeenCalledWith(item.id, null)
        })

        it('should not send second fetch request if item is being fetched', () => {
            getItemMock.mockReturnValue(null)
            const model = initModel({
                getItem: getItemMock,
            })
            const fetchSpy = vi.spyOn(model, 'fetch').mockResolvedValue(item)
            const result = model.getOrFetch(item.id)
            expect(fetchSpy).not.toHaveBeenCalled()
            expect(storeItemMock).not.toHaveBeenCalled()
            expect(result).toBeFalsy()
        })

        it('should return stored item with request, if stored', () => {
            getItemMock.mockReturnValue(item)
            const model = initModel({
                getItem: getItemMock,
            })
            const fetchSpy = vi.spyOn(model, 'fetch').mockResolvedValue(item)
            const result = model.getOrFetch(item.id)
            expect(fetchSpy).not.toHaveBeenCalled()
            expect(storeItemMock).not.toHaveBeenCalled()
            expect(result).toStrictEqual(item)
        })
    })

    describe('create', () => {
        const item = userFactory()

        it('should send post request to a correct url, store create item and return value', async() => {
            axios.post.mockResolvedValue({
                data: item,
            })
            const model = initModel()
            const result = await model.create(item)
            expect(axios.post).toHaveBeenCalledWith(baseUrl, item)
            expect(result).toStrictEqual(item)
            expect(storeItemMock).toHaveBeenCalledWith(item.id, item)
        })

        it('should support custom item extractor', async() => {
            const response = { item }
            axios.post.mockResolvedValue({
                data: response,
            })
            const model = initModel()
            const result = await model.create(item, {
                extractItem: ({ item }) => item
            })
            expect(result).toStrictEqual(response)
            expect(storeItemMock).toHaveBeenCalledWith(item.id, item)
        })

        it('should support custom url formatter', async() => {
            const url = 'somebody/once/told/me/custom'
            axios.post.mockResolvedValue({
                data: item,
            })
            const model = initModel({
                getListUrl: () => url,
            })
            await model.create(item)
            expect(axios.post).toHaveBeenCalledWith(url, item)
        })
    })

    describe('update', () => {
        const item = userFactory()

        it('should send patch request to a correct url, store updated item and return value', async() => {
            axios.patch.mockResolvedValue({
                data: item,
            })
            const itemBody = {
                a: 'b',
            }
            const model = initModel()
            const result = await model.update(item.id, itemBody)
            expect(axios.patch).toHaveBeenCalledWith(`${baseUrl}/${item.id}`, itemBody)
            expect(result).toStrictEqual(item)
            expect(storeItemMock).toHaveBeenCalledWith(item.id, item)
        })

        it('should support custom item extractor', async() => {
            const response = { item }
            axios.patch.mockResolvedValue({
                data: response,
            })
            const model = initModel()
            const result = await model.update(item.id, item, {
                extractItem: ({ item }) => item
            })
            expect(axios.patch).toHaveBeenCalledWith(`${baseUrl}/${item.id}`, item)
            expect(result).toStrictEqual(response)
            expect(storeItemMock).toHaveBeenCalledWith(item.id, item)
        })

        it('should support custom url formatter', async() => {
            axios.patch.mockResolvedValue({
                data: item,
            })
            const model = initModel({
                getItemUrl: (id) => `custom/url/${id}`
            })
            await model.update(item.id, item)
            expect(axios.patch).toHaveBeenCalledWith(`custom/url/${item.id}`, item)
        })
    })

    describe('delete', () => {
        const response = vi.fn()
        const itemId = 'somebody once told me'

        it('should send delete request to a correct url, and remove stored item', async() => {
            axios.delete.mockResolvedValue({
                data: response,
            })
            const model = initModel()
            const result = await model.delete(itemId)
            expect(axios.delete).toHaveBeenCalledWith(`${baseUrl}/${itemId}`)
            expect(result).toStrictEqual(response)
            expect(deleteItemMock).toHaveBeenCalledWith(itemId)
        })

        it('should support custom url formatter', async() => {
            axios.delete.mockResolvedValue({
                data: response,
            })
            const model = initModel({
                getItemUrl: (id) => `custom/url/${id}`
            })
            await model.delete(itemId)
            expect(axios.delete).toHaveBeenCalledWith(`custom/url/${itemId}`)
        })
    })
})
