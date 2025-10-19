import axios from 'axios'
import { AlreadyInRoomError, InviteExpiredError } from '~/chat/invite-errors'
import { chatRoomFactory } from '~/test/factories/chatRoom'
import { chatRoomInviteFactory } from '~/test/factories/chatRoomInvite'
import { roomRoleFactory } from '~/test/factories/roomRole'
import { useChatsStore } from '../chats-store'


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

    describe('room roles', () => {
        const roomId = '123'
        const role1 = roomRoleFactory({
            id: 1,
            chat_room_id: roomId,
            role: 'user',
        })
        const role2 = roomRoleFactory({
            id: 2,
            chat_room_id: roomId,
        })
        const chat1 = chatRoomFactory({
            id: roomId,
            roles: [role1, role2],
        })
        const chat2 = chatRoomFactory()

        describe('storeRoomRole', () => {
            const roleUpdate = roomRoleFactory({
                id: 1,
                chat_room_id: roomId,
                role: 'admin',
            })

            it('should store role for a chat', () => {
                useChatsStore.setState({
                    chatRooms: {
                        [chat1.id]: chat1,
                        [chat2.id]: chat2,
                    },
                })
                const store = useChatsStore.getState()
                store.storeRoomRole(roleUpdate.id, roleUpdate)
                expect(useChatsStore.getState().chatRooms).toStrictEqual({
                    [chat1.id]: {
                        ...chat1,
                        roles: [roleUpdate, role2],
                    },
                    [chat2.id]: chat2,
                })
            })

            it('should not store a role if chat room is not stored yet', () => {
                useChatsStore.setState({
                    chatRooms: {
                        [chat2.id]: chat2,
                    },
                })
                const store = useChatsStore.getState()
                store.storeRoomRole(roleUpdate.id, roleUpdate)
                expect(useChatsStore.getState().chatRooms).toStrictEqual({
                    [chat2.id]: chat2,
                })
            })
        })

        describe('unstoreRoomRole', () => {
            it('should remove a role for a chat', () => {
                useChatsStore.setState({
                    chatRooms: {
                        [chat1.id]: chat1,
                        [chat2.id]: chat2,
                        [-1]: null,
                    },
                })
                const store = useChatsStore.getState()
                store.unstoreRoomRole(role1.id)
                expect(useChatsStore.getState().chatRooms).toStrictEqual({
                    [chat1.id]: {
                        ...chat1,
                        roles: [role2],
                    },
                    [chat2.id]: chat2,
                    [-1]: null,
                })
            })

            it('should not remove a role if chat room is not stored yet', () => {
                useChatsStore.setState({
                    chatRooms: {
                        [chat2.id]: chat2,
                        [-1]: null,
                    },
                })
                const store = useChatsStore.getState()
                store.unstoreRoomRole(role1.id)
                expect(useChatsStore.getState().chatRooms).toStrictEqual({
                    [chat2.id]: chat2,
                    [-1]: null,
                })
            })
        })
    })
})
