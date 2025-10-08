import axios from 'axios'
import { chatMessageFactory } from '~/test/factories/chatMessage'
import { paginatedResponseFactory } from '~/test/factories/paginatedResponse'
import { useMessagesStore } from '../messages-store'

vi.mock('axios')

describe('messages-store', () => {
    const roomId = 1
    describe('list', () => {
        const message1 = chatMessageFactory({ id: 0 })
        const message2 = chatMessageFactory({ id: 1 })
        const message3 = chatMessageFactory({ id: 2 })
        const response = paginatedResponseFactory({
            results: [
                message1,
                message2,
                message3,
            ],
        })

        it('should send correct request, store results and return response', async () => {
            axios.get.mockResolvedValue({ data: response })
            const result = await useMessagesStore.getState().list({
                roomId,
            })
            expect(axios.get).toHaveBeenCalledWith(`/api/chat/room/${roomId}/message`, {})
            expect(result).toStrictEqual(response)
            expect(useMessagesStore.getState().messages).toStrictEqual({
                [message1.id]: message1,
                [message2.id]: message2,
                [message3.id]: message3,
            })
        })

        it('should support filters', async () => {
            const page = 2
            const search = 'somebody once told me'
            axios.get.mockResolvedValue({ data: response })
            await useMessagesStore.getState().list({
                roomId,
                filters: {
                    page,
                    search,
                },
            })
            expect(axios.get).toHaveBeenCalledWith(`/api/chat/room/${roomId}/message`, {
                params: {
                    page,
                    search,
                },
            })
        })
    })

    describe('create', () => {
        it('should send correct request, store result and return the response', async () => {
            const message = chatMessageFactory()
            axios.post.mockResolvedValue({ data: message })
            const body = {
                content: 'somebody once told me',
            }
            const result = await useMessagesStore.getState().create(
                body,
                { roomId },
            )
            expect(axios.post).toHaveBeenCalledWith(`/api/chat/room/${roomId}/message`, body)
            expect(result).toStrictEqual(message)
            expect(useMessagesStore.getState().messages[message.id]).toStrictEqual(message)
        })
    })

    describe('update', () => {
        it('should', async () => {
            const messageOldMessage1 = chatMessageFactory({ id: -1 })
            const messageOldMessage2 = chatMessageFactory()
            useMessagesStore.setState({
                messages: {
                    [messageOldMessage1.id]: messageOldMessage1,
                    [messageOldMessage2.id]: messageOldMessage2,
                }
            })
            const message = chatMessageFactory({ id: messageOldMessage2.id })
            axios.patch.mockResolvedValue({ data: message })
            const body = {
                content: 'somebody once told me',
            }
            const result = await useMessagesStore.getState().update(
                message.id,
                body,
            )
            expect(axios.patch).toHaveBeenCalledWith(`/api/chat/message/${message.id}`, body)
            expect(result).toStrictEqual(message)
            expect(useMessagesStore.getState().messages).toStrictEqual({
                [messageOldMessage1.id]: messageOldMessage1,
                [message.id]: message,
            })
        })
    })

    describe('deleteMessage', () => {
        it('should send correct request and stored delete message', async () => {
            const message1 = chatMessageFactory({ id: -1 })
            const message2 = chatMessageFactory()
            useMessagesStore.setState({
                messages: {
                    [message1.id]: message1,
                    [message2.id]: message2,
                }
            })
            axios.delete.mockResolvedValue({ data: null })
            const result = await useMessagesStore.getState().deleteMessage(message2.id)
            expect(axios.delete).toHaveBeenCalledWith(`/api/chat/message/${message2.id}`)
            expect(result).toStrictEqual(null)
            expect(useMessagesStore.getState().messages).toStrictEqual({
                [message1.id]: message1,
            })
        })
    })
})
