import { useShallow } from 'zustand/shallow'
import { useAuthStore } from '~/auth/auth-store'
import { useChatsStore } from '~/chat/chats-store'
import { RoomRoleEnum, type ChatMessage } from '~/chat/types'


const ROLES_THAT_CAN_DELETE = [RoomRoleEnum.ADMIN, RoomRoleEnum.MODERATOR]

interface UseMessagePermissionsOptions {
    message: ChatMessage
}

interface MessagePermissions {
    canEdit: boolean
    canDelete: boolean
}

export const useMessagePermissions = (options: UseMessagePermissionsOptions): MessagePermissions => {
    const { message } = options
    const userId = useAuthStore((state) => state.userId)
    const chat = useChatsStore(useShallow((state) => state.chatRooms[message.chat_room_id]))
    const isCreator = message.created_by_id === userId
    if (!userId || !chat) {
        return {
            canEdit: false,
            canDelete: false,
        }
    }
    const userRole = chat.roles.find((role) => role.user_id === userId)
    const hasDeleteRole = userRole ? ROLES_THAT_CAN_DELETE.includes(userRole.role) : false
    return {
        canEdit: isCreator,
        canDelete: isCreator || hasDeleteRole,
    }
}
