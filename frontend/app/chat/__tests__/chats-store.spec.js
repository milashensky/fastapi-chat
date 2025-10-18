import axios from 'axios'
import { useChatsStore } from '../chats-store'
import { chatRoomFactory } from '~/test/factories/chatRoom'
import { chatRoomInviteFactory } from '~/test/factories/chatRoomInvite'
import { AlreadyInRoomError, InviteExpiredError } from '~/chat/invite-errors'


vi.mock('axios')

describe('ChatsStore', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useChatsStore.setState({
            chatRooms: {},
        })
    })

    describe('createChatInvite', () => {
        it('should create chat invite and return invite data', async () => {
            const roomId = 123
            const inviteData = chatRoomInviteFactory()
            axios.post.mockResolvedValue({
                data: inviteData,
            })
            const store = useChatsStore.getState()
            const result = await store.createChatInvite(roomId)
            expect(axios.post).toHaveBeenCalledWith(`/api/chat/rooms/${roomId}/invite`)
            expect(result).toStrictEqual(inviteData)
        })
    })

    describe('acceptChatInvite', () => {
        it('should accept invite and store chat room', async () => {
            const inviteId = 'invite-123'
            const chatRoom = chatRoomFactory()
            axios.get.mockResolvedValue({
                data: chatRoom,
            })
            const store = useChatsStore.getState()
            const result = await store.acceptChatInvite(inviteId)
            expect(axios.get).toHaveBeenCalledWith(`/api/chat/room-invite/${inviteId}`)
            expect(result).toStrictEqual(chatRoom)
            expect(useChatsStore.getState().chatRooms[chatRoom.id]).toStrictEqual(chatRoom)
        })

        it('should throw AlreadyInRoomError for 412 response', async () => {
            const inviteId = 'invite-123'
            const chatRoomId = 456
            const message = 'You are already in this room'
            const errorResponse = {
                response: {
                    status: 412,
                    data: {
                        detail: {
                            message,
                            chat_room_id: chatRoomId,
                        },
                    },
                },
            }
            axios.get.mockRejectedValue(errorResponse)
            axios.isAxiosError.mockReturnValue(true)
            const store = useChatsStore.getState()
            await expect(store.acceptChatInvite(inviteId)).rejects.toThrow(AlreadyInRoomError)
            await expect(store.acceptChatInvite(inviteId)).rejects.toThrow(message)
            try {
                await store.acceptChatInvite(inviteId)
            }
            catch (error) {
                expect(error.chatRoomId).toBe(chatRoomId)
            }
        })

        it('should throw InviteExpiredError for 410 response', async () => {
            const inviteId = 'invite-123'
            const errorResponse = {
                response: {
                    status: 410,
                    data: {},
                },
            }
            axios.get.mockRejectedValue(errorResponse)
            axios.isAxiosError.mockReturnValue(true)
            const store = useChatsStore.getState()
            await expect(store.acceptChatInvite(inviteId)).rejects.toThrow(InviteExpiredError)
            await expect(store.acceptChatInvite(inviteId)).rejects.toThrow('Invite is expired')
        })

        it('should throw original error for other status codes', async () => {
            const inviteId = 'invite-123'
            const errorResponse = {
                response: {
                    status: 500,
                    data: {},
                },
            }
            axios.get.mockRejectedValue(errorResponse)
            axios.isAxiosError.mockReturnValue(true)
            const store = useChatsStore.getState()
            await expect(store.acceptChatInvite(inviteId)).rejects.toBe(errorResponse)
        })
    })
})
