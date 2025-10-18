import { useContext } from "react"
import { useShallow } from "zustand/shallow"
import { useChatsStore } from "~/chat/chats-store"
import { chatRoomContext } from "~/chat/chat-room/chat-room-context"
import ChatInviteButton from "~/chat/invite/chat-invite-button"
import { pluralize } from "~/utils/pluralize"
import MembersList from "./members-list"

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
            <MembersList
                chatMembers={chat.roles}
            />
            {/* todo: rbac */}
            <ChatInviteButton
                roomId={roomId}
            />
        </div>
    )
}

export default ChatDetails
