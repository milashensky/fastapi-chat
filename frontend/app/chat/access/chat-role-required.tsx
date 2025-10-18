import { useShallow } from 'zustand/shallow'
import type { RoomRoleEnum } from '~/chat/types'
import { useAuthStore } from '~/auth/auth-store'
import { useChatsStore } from '~/chat/chats-store'


interface Props {
    allowFor: RoomRoleEnum[]
    roomId: number
    notAllowed?: React.ReactNode
    children: React.ReactNode
}

const ChatRoleRequired = (props: Props) => {
    const {
        notAllowed,
        children,
        roomId,
        allowFor,
    } = props
    const userId = useAuthStore((state) => state.userId)
    if (!userId) {
        return notAllowed
    }
    const chat = useChatsStore(useShallow((state) => state.chatRooms[roomId]))
    if (!chat) {
        return notAllowed
    }
    const userRole = chat.roles.find((role) => role.user_id === userId)
    if (!userRole) {
        return notAllowed
    }
    const hasRequiredRole = allowFor.includes(userRole.role)
    if (!hasRequiredRole) {
        return notAllowed
    }
    return children
}

export default ChatRoleRequired
