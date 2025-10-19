import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { useShallow } from 'zustand/shallow'
import { useAuthStore } from '~/auth/auth-store'
import { chatRoomContext } from '~/chat/chat-room/chat-room-context'
import { useChatsStore } from '~/chat/chats-store'
import ConfirmationDialog from '~/ui-kit/confirmation-dialog'
import Button from '~/ui-kit/button'
import { ROOT_ROUTE } from '~/utils/constants'


const LeaveChatButton = () => {
    const [isConfirmShown, setConfirmShown] = useState(false)
    const { roomId } = useContext(chatRoomContext)
    const currentUserId = useAuthStore(({ userId }) => userId)
    const currentRole = useChatsStore(useShallow((state) => state.chatRooms[roomId]?.roles.find((role) => role.user_id === currentUserId)))
    const deleteRoomRole = useChatsStore((state) => state.deleteRoomRole)
    const unstoreChat = useChatsStore((state) => state.unstoreChat)
    const navigate = useNavigate()
    const leaveChat = async () => {
        if (!currentRole) {
            return
        }
        await deleteRoomRole(currentRole.id)
        unstoreChat(roomId)
        navigate(ROOT_ROUTE)
    }
    return (
        <div>
            <Button
                disabled={!currentRole}
                color="danger"
                onClick={() => setConfirmShown(true)}
            >
                Leave chat room
            </Button>
            <ConfirmationDialog
                color="danger"
                content="You won't be able to see the chat messages anymore."
                isShown={isConfirmShown}
                onConfirm={leaveChat}
                onClose={() => setConfirmShown(false)}
            />
        </div>
    )
}

export default LeaveChatButton
