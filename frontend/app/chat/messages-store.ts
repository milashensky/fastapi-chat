import { create } from "zustand"
import { combine } from "zustand/middleware"
import type {
    ChatMessage,
    CreateMessageForm,
    UpdateMessageForm,
} from "./types"
import type {
    IdModelTable,
    Override,
    PaginatedResponse,
    PaginationFilters,
    SearchFilters,
} from "~/globals/types"
import {
    useModel,
    type ModelDefenition,
    type ListConfig as BaseListConfig,
    type RequestConfig,
} from "~/utils/useModel"

type MessageId = ChatMessage['id']

interface MessageListRequestOptions extends RequestConfig<ChatMessage, ChatMessage> {
    roomId: number
}

type ListConfig = BaseListConfig<ChatMessage, ListResponse, ListFilters> & MessageListRequestOptions

interface MessagesStore {
    messages: IdModelTable<ChatMessage>,
    list: (config: ListConfig) => Promise<ListResponse>
    create: (body: CreateMessageForm, options: MessageListRequestOptions) => Promise<ChatMessage>
    update: (messageId: MessageId, body: UpdateMessageForm) => Promise<ChatMessage>
    deleteMessage: (messageId: MessageId) => Promise<null>
    storeMessage: (messageId: MessageId, message: ChatMessage | null) => void
    unstoreMessage: (messageId: MessageId) => void
}

type ListResponse = PaginatedResponse<ChatMessage>

type ListFilters = PaginationFilters & SearchFilters

type MessageDefenition = Override<ModelDefenition<ChatMessage>, {
    ItemPk: MessageId
    CreateItemBody: CreateMessageForm
    ListResponse: ListResponse
    ListFilters: PaginationFilters & SearchFilters,
}>


export const useMessagesStore = create<MessagesStore>(
    combine(
        {
            messages: {} as IdModelTable<ChatMessage>,
        },
        (set, get) => {
            const storeMessage = (messageId: MessageId, message: ChatMessage | null) => {
                set((state) => ({
                    messages: {
                        ...state.messages,
                        [messageId]: message,
                    },
                }))
            }
            const unstoreMessage = (messageId: MessageId) => {
                const { messages } = get()
                delete messages[messageId]
                set(() => ({
                    messages,
                }))
            }
            const {
                list: listBase,
                create: createBase,
                update,
                delete: deleteMessage,
            } = useModel<
                ChatMessage,
                MessageDefenition
            >({
                baseUrl: '/api/chat/message',
                getListUrl: ({ roomId }) => {
                    return `/api/chat/room/${roomId}/message`
                },
                storeItem: storeMessage,
                deleteItem: unstoreMessage,
                getItem: (messageId: MessageId): ChatMessage | null | undefined => {
                    const { messages } = get()
                    return messages[messageId]
                },
            })
            const create = (body: CreateMessageForm, options: MessageListRequestOptions) => createBase(body, options)
            const list = (config: ListConfig) => {
                return listBase({
                    ...config,
                    extractItems: (response: ListResponse) => response.results,
                })
            }
            return {
                list,
                create,
                update,
                deleteMessage,
                storeMessage,
                unstoreMessage,
            }
        },
    ),
)
