import axios from "axios"
import { create } from "zustand"
import { combine } from 'zustand/middleware'
import type { IdModelTable, Override } from "~/globals/types"
import { useModel, type ModelDefenition } from "~/utils/useModel"
import { asList } from "~/utils/asList"
import type {
    ChatRoom,
    ChatRoomInvite,
    CreateChatForm,
    UpdateChatForm,
} from "./types"
import {
    AlreadyInRoomError,
    InviteExpiredError,
    type AlreadyInRoomDetail,
} from "./invite-errors"

type RoomId = ChatRoom['id']

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
                } catch (error) {
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
            }
        },
    ),
)

export const getChats = (state: ChatsStore): ChatRoom[] => asList(state.chatRooms)
