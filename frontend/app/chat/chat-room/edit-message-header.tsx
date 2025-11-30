import { useContext } from 'react'
import Button from '~/ui-kit/button'
import Icon from '~/ui-kit/icon'
import { chatRoomContext } from './chat-room-context'
import './styles/edit-message-header.scss'


const EditMessageHeader = () => {
    const {
        setEditingMessageId,
        editingMessage,
    } = useContext(chatRoomContext)
    const cancelEdit = () => {
        setEditingMessageId(null)
    }
    return (
        <div className="message-edit-header">
            <Icon
                icon="edit"
            />
            <div className="flex flex-col w-full">
                <div className="message-edit-info">
                    <span className="message-edit-label">Edit message</span>
                </div>
                <p>
                    { editingMessage?.content }
                </p>
            </div>
            <Button
                icon
                color="secondary"
                onClick={cancelEdit}
                data-testid="cancel-edit-button"
            >
                <Icon icon="close" />
            </Button>
        </div>
    )
}

export default EditMessageHeader
