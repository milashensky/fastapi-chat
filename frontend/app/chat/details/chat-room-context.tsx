import { createContext } from "react";

export const chatRoomContext = createContext({
    roomId: 0,
    sendMessage: (message: string) => Promise.resolve(),
})
