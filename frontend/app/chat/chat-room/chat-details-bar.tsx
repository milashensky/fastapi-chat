import { useContext } from "react"
import { useShallow } from "zustand/shallow"

import { useChatsStore } from "~/chat/chats-store"
import { chatRoomContext } from "~/chat/chat-room/chat-room-context"
import SkeletonLoader from "~/ui-kit/skeleton-loader"
import Button from "~/ui-kit/button"
import Icon from "~/ui-kit/icon"

import './styles/chat-details-bar.scss'
import { CHAT_BASE_ROUTE } from "~/utils/constants"
import { NavLink, Outlet } from "react-router"

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
            <NavLink
                to={`${CHAT_BASE_ROUTE}/${roomId}/details`}
                className="no-underline w-full"
                role="button"
            >
                <h3 className="chat-room-title">
                    { room.name }
                </h3>
            </NavLink>
            <Button
                icon
                color="secondary"
            >
                <Icon icon="search" />
            </Button>
        </div>
    )
}

export default ChatDetailsBar
