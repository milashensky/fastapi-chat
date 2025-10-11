import { useContext } from "react"
import { useShallow } from "zustand/shallow"
import { chatRoomContext } from "~/chat/chat-room/chat-room-context"
import { useChatsStore } from "~/chat/chats-store"
import { pluralize } from "~/utils/pluralize"

export const handle = {
    title: 'Chat details',
}


const ChatDetails = () => {
    const { roomId } = useContext(chatRoomContext)
    const chat = useChatsStore(useShallow((state) => state.chatRooms[roomId]))
    if (!chat) {
        return (
            <div />
        )
    }
    return (
        <div>
            <h4>
                { chat.name }
            </h4>
            <p>
                { chat.roles.length } {pluralize('Member', chat.roles.length)}
            </p>
        </div>
    )
}

export default ChatDetails
