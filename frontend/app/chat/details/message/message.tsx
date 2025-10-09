import { useAuthStore } from "~/auth/auth-store"
import type { ChatMessage } from "~/chat/types"
import { formatTime } from "~/utils/datetime"

import MessageAuthor from "./message-author"
import './styles/message.scss'

interface Props {
    message: ChatMessage
}

const Message = (props: Props) => {
    const { message } = props
    const currentUserId = useAuthStore((state) => state.userId)
    const isCurrentUserMessage = message.created_by_id === currentUserId
    const classes = [
        isCurrentUserMessage ? 'owners' : 'others',
        'message',
    ].join(' ')
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
            <small className="message-time">
                {formatTime(message.created_at)}
            </small>
        </div>
    )
}

export default Message
