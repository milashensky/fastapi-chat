import { useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import { chatRoomContext } from '~/chat/chat-room/chat-room-context'
import { useChatsStore } from '~/chat/chats-store'
import ConfirmationDialog from '~/ui-kit/confirmation-dialog'
import Button from '~/ui-kit/button'
import { ROOT_ROUTE } from '~/utils/constants'


const DeleteChatButton = () => {
    const [isConfirmShown, setConfirmShown] = useState(false)
    const { roomId } = useContext(chatRoomContext)
    const deleteChat = useChatsStore((state) => state.deleteChat)
    const navigate = useNavigate()
    const confirmDelete = async () => {
        await deleteChat(roomId)
        navigate(ROOT_ROUTE)
    }
    return (
        <div>
            <Button
                color="danger"
                onClick={() => setConfirmShown(true)}
            >
                Delete chat permanently
            </Button>
            <ConfirmationDialog
                color="danger"
                content="All messages will be deleted without ability to restore them, for everyone in this chat."
                confirmText="Yes, let it burn"
                dismissText="No, I just misclicked"
                isShown={isConfirmShown}
                onConfirm={confirmDelete}
                onClose={() => setConfirmShown(false)}
            />
        </div>
    )
}

export default DeleteChatButton
