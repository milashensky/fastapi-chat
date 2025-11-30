import { useContext } from 'react'
import { useAuthStore } from '~/auth/auth-store'
import type { ChatMessage } from '~/chat/types'
import { formatTime } from '~/utils/datetime'
import Button from '~/ui-kit/button'
import Icon from '~/ui-kit/icon'
import { chatRoomContext } from '../chat-room-context'
import MessageAuthor from './message-author'
import DeleteMessageButton from './delete-message-button'
import { useMessagePermissions } from './use-message-permissions'
import './styles/message.scss'


interface Props {
    message: ChatMessage
}

const Message = (props: Props) => {
    const { message } = props
    const { setEditingMessageId } = useContext(chatRoomContext)
    const currentUserId = useAuthStore((state) => state.userId)
    const isCurrentUserMessage = message.created_by_id === currentUserId
    const { canEdit, canDelete } = useMessagePermissions({ message })
    const hasActions = canEdit || canDelete
    const classes = [
        isCurrentUserMessage ? 'owners' : 'others',
        'message',
    ].join(' ')
    const startEditing = () => {
        setEditingMessageId(message.id)
    }
    return (
        <div
            className={classes}
            data-testid={`message-${message.id}`}
        >
            <MessageAuthor
                userId={message.created_by_id}
            />
            <p className="message-content">
                {message.content}
            </p>
            <div className="message-footer">
                <small className="message-time">
                    {formatTime(message.created_at)}
                    {message.updated_at && ' (edited)'}
                </small>
                {
                    hasActions && (
                        <div className="message-actions">
                            {
                                canEdit && (
                                    <Button
                                        icon
                                        color="secondary"
                                        onClick={startEditing}
                                        data-testid="edit-message-button"
                                    >
                                        <Icon icon="edit" />
                                    </Button>
                                )
                            }
                            {canDelete && <DeleteMessageButton message={message} />}
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default Message
