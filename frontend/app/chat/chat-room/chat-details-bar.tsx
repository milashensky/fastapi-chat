import { useContext } from 'react'
import { NavLink } from 'react-router'
import { useShallow } from 'zustand/shallow'

import { useChatsStore } from '~/chat/chats-store'
import { chatRoomContext, ChatRoomStateEnum } from '~/chat/chat-room/chat-room-context'
import SkeletonLoader from '~/ui-kit/skeleton-loader'
import Button from '~/ui-kit/button'
import Icon from '~/ui-kit/icon'
import { CHAT_BASE_ROUTE } from '~/utils/constants'

import ChatSearchBar from './chat-search-bar'
import './styles/chat-details-bar.scss'


const ChatDetailsBar = () => {
    const {
        roomId,
        state,
        setState,
    } = useContext(chatRoomContext)
    const room = useChatsStore(useShallow((state) => state.chatRooms[roomId]))
    if (!room) {
        return (
            <div className="chat-room-top-bar">
                <SkeletonLoader />
            </div>
        )
    }
    if (state === ChatRoomStateEnum.SEARCH) {
        return <ChatSearchBar />
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
                onClick={() => setState(ChatRoomStateEnum.SEARCH)}
            >
                <Icon icon="search" />
            </Button>
        </div>
    )
}

export default ChatDetailsBar
