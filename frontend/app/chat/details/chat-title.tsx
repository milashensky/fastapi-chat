import { useState } from 'react'
import { RoomRoleEnum, type ChatRoom } from '~/chat/types'
import ChatRoleRequired from '~/chat/access/chat-role-required'
import Button from '~/ui-kit/button'
import Icon from '~/ui-kit/icon'
import EditChatNameForm from './edit-chat-name-form'


interface Props {
    chat: ChatRoom
}

const ChatTitle = (props: Props) => {
    const {
        chat,
    } = props
    const [isEdit, setEdit] = useState(false)
    if (isEdit) {
        return (
            <EditChatNameForm
                chat={chat}
                onBack={() => setEdit(false)}
            />
        )
    }
    return (
        <div className="flex justify-between items-center mb-2">
            <h4 className="mb-0">
                { chat.name }
            </h4>
            <ChatRoleRequired
                roomId={chat.id}
                allowFor={[RoomRoleEnum.ADMIN]}
            >
                <Button
                    icon
                    color="secondary"
                    onClick={() => setEdit(true)}
                >
                    <Icon
                        icon="edit"
                    />
                </Button>
            </ChatRoleRequired>
        </div>
    )
}

export default ChatTitle
