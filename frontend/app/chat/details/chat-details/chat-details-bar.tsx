import { useContext } from "react"
import { useShallow } from "zustand/shallow"

import { useChatsStore } from "~/chat/chats-store"
import { chatRoomContext } from "~/chat/details/chat-room-context"
import SkeletonLoader from "~/ui-kit/skeleton-loader"
import Button from "~/ui-kit/button"
import Icon from "~/ui-kit/icon"

import './styles/chat-details-bar.scss'

const ChatDetailsBar = () => {
    const { roomId } = useContext(chatRoomContext)
    const room = useChatsStore(useShallow((state) => state.chatRooms[roomId]))
    if (!room) {
        return (
            <div className="chat-room-top-bar">
                <SkeletonLoader />
            </div>
        )
    }
    return (
        <div className="chat-room-top-bar">
            <h3 className="chat-room-title">
                { room.name }
            </h3>
            <Button
                icon
                color="secondary"
            >
                <Icon icon="search" />
            </Button>
            <Button
                icon
                color="secondary"
            >
                <Icon icon="vertical-ellipsis" />
            </Button>
        </div>
    )
}

export default ChatDetailsBar
