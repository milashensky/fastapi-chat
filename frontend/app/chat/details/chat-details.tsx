import { useContext } from 'react'
import { useShallow } from 'zustand/shallow'
import { useChatsStore } from '~/chat/chats-store'
import ChatRoleRequired from '~/chat/access/chat-role-required'
import { chatRoomContext } from '~/chat/chat-room/chat-room-context'
import ChatInviteButton from '~/chat/invite/chat-invite-button'
import { RoomRoleEnum } from '~/chat/types'
import { pluralize } from '~/utils/pluralize'
import Icon from '~/ui-kit/icon'
import MembersList from './members-list'
import './styles/chat-details.scss'


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
            <b className="chat-members-heading">
                <Icon
                    icon="members"
                />
                { chat.roles.length } {pluralize('Member', chat.roles.length)}
            </b>
            <MembersList
                chatMembers={chat.roles}
            />
            <ChatRoleRequired
                roomId={roomId}
                allowFor={[RoomRoleEnum.ADMIN, RoomRoleEnum.MODERATOR]}
            >
                <ChatInviteButton
                    roomId={roomId}
                />
            </ChatRoleRequired>
        </div>
    )
}

export default ChatDetails
