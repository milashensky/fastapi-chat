import {
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import Textarea, { type TextareaRef } from '~/ui-kit/textarea'
import Button from '~/ui-kit/button'
import Icon from '~/ui-kit/icon'
import { useKeyboardShortcut } from '~/utils/useKeyboardShortcut'
import { chatRoomContext } from './chat-room-context'
import './styles/chat-input-form.scss'


const MessageInputForm = () => {
    const [message, setMessage] = useState('')
    const context = useContext(chatRoomContext)
    const { editingMessage, setEditingMessageId } = context
    const isEditing = editingMessage !== null
    useEffect(() => {
        if (editingMessage) {
            setMessage(editingMessage.content)
            return
        }
        setMessage('')
    }, [editingMessage])
    const cancelEdit = () => {
        setEditingMessageId(null)
    }
    const cleanedMessage = message.trim()
    const submitMessage = async () => {
        if (!cleanedMessage) {
            return
        }
        await context.sendMessage(cleanedMessage)
        setMessage('')
    }
    const textareaRef = useRef<TextareaRef>(null)
    useEffect(() => {
        const element = textareaRef.current
        element?.focus()
    }, [context.roomId, editingMessage])
    useKeyboardShortcut({
        shortcut: 'ctrl+enter',
        callback: submitMessage,
    })
    useKeyboardShortcut({
        shortcut: 'escape',
        callback: cancelEdit,
    })
    const placeholder = isEditing ? 'Edit your message...' : 'Write a message...'
    return (
        <div className="message-input-container">
            <Textarea
                ref={textareaRef}
                autoGrow
                autoFocus
                placeholder={placeholder}
                className="message-input"
                value={message}
                name="message"
                onInput={setMessage}
            />
            {
                cleanedMessage && (
                    <Button
                        className="message-send"
                        icon
                        onClick={submitMessage}
                        data-testid={isEditing ? 'save-edit-button' : 'send-message-button'}
                    >
                        <Icon icon={isEditing ? 'accept' : 'send'} />
                    </Button>
                )
            }
        </div>
    )
}

export default MessageInputForm
