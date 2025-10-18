import { createContext } from 'react'


export interface ChatRoomContext {
    roomId: number
    sendMessage: (message: string) => Promise<void>
}

export const chatRoomContext = createContext<ChatRoomContext>({
    roomId: 0,
    sendMessage: () => Promise.resolve(),
})
