import { useState } from 'react'
import type { ChatMessage } from '~/chat/types'
import { useMessagesStore } from '~/chat/messages-store'
import Button from '~/ui-kit/button'
import ConfirmationDialog from '~/ui-kit/confirmation-dialog'
import Icon from '~/ui-kit/icon'


interface Props {
    message: ChatMessage
}

const DeleteMessageButton = (props: Props) => {
    const { message } = props
    const [isConfirmShown, setConfirmShown] = useState(false)
    const deleteMessage = useMessagesStore((state) => state.deleteMessage)
    const handleDelete = async () => {
        await deleteMessage(message.id)
    }
    return (
        <div className="contents">
            <Button
                icon
                color="danger"
                onClick={() => setConfirmShown(true)}
                data-testid="delete-message-button"
            >
                <Icon icon="delete" />
            </Button>
            <ConfirmationDialog
                color="danger"
                title="Delete message?"
                content="This action cannot be undone."
                isShown={isConfirmShown}
                onConfirm={handleDelete}
                onClose={() => setConfirmShown(false)}
            />
        </div>
    )
}

export default DeleteMessageButton
