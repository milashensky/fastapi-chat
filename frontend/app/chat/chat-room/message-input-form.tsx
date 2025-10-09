import { useContext, useState } from 'react'
import Textarea from "~/ui-kit/textarea"
import Button from "~/ui-kit/button"
import Icon from '~/ui-kit/icon'
import { useKeyboardShortcut } from '~/utils/useKeyboardShortcut'
import { chatRoomContext } from "./chat-room-context"
import './styles/chat-input-form.scss'


const MessageInputForm = () => {
    const [message, setMessage] = useState('')
    const context = useContext(chatRoomContext)
    const cleanedMessage = message.trim()
    const sendMessage = async () => {
        if (!cleanedMessage) {
            return
        }
        await context.sendMessage(cleanedMessage)
        setMessage('')
    }
    useKeyboardShortcut({
        shortcut: 'ctrl+enter',
        callback: sendMessage,
    })
    return (
        <div className="message-input-container">
            <Textarea
                autoGrow
                autoFocus
                placeholder="Write a message..."
                className="message-input"
                value={message}
                name="message"
                onInput={setMessage}
            />
            {
                cleanedMessage &&
                <Button
                    className="message-send"
                    icon
                    onClick={sendMessage}
                >
                    <Icon icon="send" />
                </Button>
            }
        </div>
    )
}

export default MessageInputForm
