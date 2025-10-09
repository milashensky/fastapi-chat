import type { ChatMessage } from "~/chat/types"

import './styles/system-message.scss'

interface Props {
    message: ChatMessage
}

const SystemMessage = (props: Props) => {
    const { message } = props
    return (
        <div
            className="system-message"
            data-testid={`system-message-${message.id}`}
        >
            <p className="message-content">
                {message.content}
            </p>
        </div>
    )
}

export default SystemMessage
