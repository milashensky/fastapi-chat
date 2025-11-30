import { createContext, useState } from 'react'
import { useMessagesStore } from '~/chat/messages-store'
import type { ChatMessage } from '~/chat/types'


export enum ChatRoomStateEnum {
    MESSAGE = 'message',
    SEARCH = 'search',
}

export interface ChatRoomContext {
    roomId: number
    state: ChatRoomStateEnum
    setState: (newState: ChatRoomStateEnum) => void
    search: string
    setSearch: (search: string) => void
    sendMessage: (message: string) => Promise<void>
    editingMessage: ChatMessage | null
    setEditingMessageId: (messageId: ChatMessage['id'] | null) => void
}

export const chatRoomContext = createContext<ChatRoomContext>({
    roomId: 0,
    search: '',
    setSearch: () => {},
    state: ChatRoomStateEnum.MESSAGE,
    setState: () => {},
    sendMessage: () => Promise.resolve(),
    editingMessage: null,
    setEditingMessageId: () => {},
})

interface UseChatRoomContextOptions {
    roomId: number
}

export const useChatRoomContext = (options: UseChatRoomContextOptions): ChatRoomContext => {
    const { roomId } = options
    const createMessage = useMessagesStore((state) => state.create)
    const updateMessage = useMessagesStore((state) => state.update)
    const [search, setSearch] = useState('')
    const [state, setState] = useState(ChatRoomStateEnum.MESSAGE)
    const [editingMessageId, setEditingMessageId] = useState<ChatMessage['id'] | null>(null)
    const editingMessage = useMessagesStore((storeState) => {
        if (editingMessageId === null) {
            return null
        }
        return storeState.messages[editingMessageId] ?? null
    })
    const sendMessage = async (content: string) => {
        // use editingMessage instead of editingMessageId to handle case when message is deleted while editing
        if (editingMessage !== null) {
            await updateMessage(editingMessage.id, { content })
            setEditingMessageId(null)
            return
        }
        await createMessage({ content }, { roomId })
    }
    return {
        roomId,
        state,
        setState,
        search,
        setSearch,
        sendMessage,
        editingMessage,
        setEditingMessageId,
    }
}
