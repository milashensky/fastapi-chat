import { create } from "zustand";
import { combine } from 'zustand/middleware'
import { useModel, type ModelDefenition } from "~/utils/useModel"
import type { IdModelTable, Override } from "~/globals/types";
import type {
    ChatRoom,
    CreateChatForm,
    UpdateChatForm,
} from "./types"
import { excludeNullish } from "~/utils/excludeNullish"

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
            return {
                getOrFetch,
                fetch,
                list,
                create,
                update,
                deleteChat,
                storeChat,
                unstoreChat,
            }
        },
    ),
)

export const getChats = (state: ChatsStore): ChatRoom[] => Object.values(state.chatRooms).filter(excludeNullish)
