import { createContext } from 'react'


export enum ChatRoomStateEnum {
    MESSAGE = 'message',
    SEARCH = 'search',
}

export interface ChatRoomContext {
    roomId: number
    state: ChatRoomStateEnum
    setState: (newState: ChatRoomStateEnum) => void,
    search: string
    setSearch: (search: string) => void
    sendMessage: (message: string) => Promise<void>
}

export const chatRoomContext = createContext<ChatRoomContext>({
    roomId: 0,
    search: '',
    setSearch: () => {},
    state: ChatRoomStateEnum.MESSAGE,
    setState: () => {},
    sendMessage: () => Promise.resolve(),
})
