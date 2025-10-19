import axios from 'axios'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import type { IdModelTable, Override } from '~/globals/types'
import { useModel, type ModelDefenition } from '~/utils/useModel'
import { asList } from '~/utils/asList'
import type {
    ChatRoom,
    ChatRoomInvite,
    CreateChatForm,
    RoomRole,
    UpdateChatForm,
    UpdateRoomRoleForm,
} from './types'
import {
    AlreadyInRoomError,
    InviteExpiredError,
    type AlreadyInRoomDetail,
} from './invite-errors'
import { toMap } from '~/utils/toMap'


type RoomId = ChatRoom['id']
type RoomRoleId = RoomRole['id']

export interface ChatsStore {
    chatRooms: IdModelTable<ChatRoom>
    storeChat: (chatId: RoomId, chat: ChatRoom | null) => void
    unstoreChat: (chatId: RoomId) => void
    getOrFetch: (chatId: RoomId) => ChatRoom | undefined | null
    fetch: (chatId: RoomId) => Promise<ChatRoom>
    create: (body: CreateChatForm) => Promise<ChatRoom>
    list: () => Promise<ChatRoom[]>
    update: (chatId: RoomId, body: UpdateChatForm) => Promise<ChatRoom>
    deleteChat: (chatId: RoomId) => Promise<null>
    createChatInvite: (chatId: RoomId) => Promise<ChatRoomInvite>
    acceptChatInvite: (inviteId: ChatRoomInvite['id']) => Promise<ChatRoom>
    storeRoomRole: (roleId: RoomRoleId, role: RoomRole | null) => void
    unstoreRoomRole: (roleId: RoomRoleId) => void
    updateRoomRole: (roleId: RoomRoleId, role: UpdateRoomRoleForm) => Promise<RoomRole>
    deleteRoomRole: (roleId: RoomRoleId) => Promise<null>
}

type ChatsDefenition = Override<ModelDefenition<ChatRoom>, {
    ItemPk: RoomId,
    CreateItemBody: CreateChatForm,
}>

export const useChatsStore = create<ChatsStore>(
    combine(
        {
            chatRooms: {} as IdModelTable<ChatRoom>,
        },
        (set, get) => {
            const storeChat = (chatId: RoomId, chat: ChatRoom | null) => {
                set((state) => ({
                    chatRooms: {
                        ...state.chatRooms,
                        [chatId]: chat,
                    },
                }))
            }
            const unstoreChat = (chatId: RoomId) => {
                const { chatRooms } = get()
                delete chatRooms[chatId]
                set(() => ({
                    chatRooms,
                }))
            }
            const {
                getOrFetch,
                fetch,
                list,
                create,
                update,
                delete: deleteChat,
            } = useModel<
                ChatRoom,
                ChatsDefenition
            >({
                baseUrl: '/api/chat/rooms',
                storeItem: storeChat,
                deleteItem: unstoreChat,
                getItem: (chatId: RoomId): ChatRoom | null | undefined => {
                    const { chatRooms } = get()
                    return chatRooms[chatId]
                },
            })
            const createChatInvite = async (roomId: RoomId) => {
                const response = await axios.post<ChatRoomInvite>(`/api/chat/rooms/${roomId}/invite`)
                return response.data
            }
            const acceptChatInvite = async (inviteId: ChatRoomInvite['id']) => {
                try {
                    const { data } = await axios.get<ChatRoom>(`/api/chat/room-invite/${inviteId}`)
                    storeChat(data.id, data)
                    return data
                }
                catch (error) {
                    if (!axios.isAxiosError(error) || !error.response) {
                        throw error
                    }
                    if (error.response.status === 412) {
                        const detail = error.response.data?.detail as AlreadyInRoomDetail
                        throw new AlreadyInRoomError(detail.message, detail.chat_room_id)
                    }
                    if (error.response.status === 410) {
                        throw new InviteExpiredError('Invite is expired')
                    }
                    throw error
                }
            }
            const storeRoomRole = (roleId: RoomRoleId, role: RoomRole | null) => {
                if (!role) {
                    return
                }
                const { chatRooms } = get()
                const room = chatRooms[role.chat_room_id]
                if (!room) {
                    return
                }
                const roomRoles = toMap(room.roles, 'id')
                roomRoles[roleId] = role
                storeChat(role.chat_room_id, {
                    ...room,
                    roles: Object.values(roomRoles),
                })
            }
            const unstoreRoomRole = (roleId: RoomRoleId) => {
                const { chatRooms } = get()
                const roomsEntries = Object.entries(chatRooms)
                const updatedRooms = roomsEntries.map(([roomId, room]) => {
                    if (!room) {
                        return [roomId, room]
                    }
                    const updatedRoles = room.roles.filter(({ id }) => id !== roleId)
                    const updatedRoom = {
                        ...room,
                        roles: updatedRoles,
                    }
                    return [roomId, updatedRoom]
                })
                set({
                    chatRooms: Object.fromEntries(updatedRooms),
                })
            }
            const {
                update: updateRoomRole,
                delete: deleteRoomRole,
            } = useModel<RoomRole>({
                baseUrl: '/api/chat/room-role',
                storeItem: storeRoomRole,
                deleteItem: unstoreRoomRole,
            })
            return {
                getOrFetch,
                fetch,
                list,
                create,
                update,
                deleteChat,
                storeChat,
                unstoreChat,
                createChatInvite,
                acceptChatInvite,
                storeRoomRole,
                unstoreRoomRole,
                updateRoomRole,
                deleteRoomRole,
            }
        },
    ),
)

export const getChats = (state: ChatsStore): ChatRoom[] => asList(state.chatRooms)
