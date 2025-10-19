import { useContext } from 'react'
import { MessageTypeEnum, type ChatMessage } from '~/chat/types'
import Intersection from '~/ui-kit/intersection'
import { toLocalIsoDate } from '~/utils/datetime'

import { chatRoomContext } from './chat-room-context'
import { useRoomMessages } from './use-room-messages'
import Message from './message/message'
import MessageGroupDate from './message/message-group-date'
import './styles/message-list.scss'
import SystemMessage from './message/system-message'


const MessageList = () => {
    const {
        roomId,
        search,
    } = useContext(chatRoomContext)
    const {
        isLoading,
        messages,
        canFetchNext,
        fetchNext,
    } = useRoomMessages({
        roomId,
        search,
    })

    const combineMessages = (messages: ChatMessage[]): React.ReactNode[]=> {
        const combinedMessages: React.ReactNode[] = []
        let lastSender: number | null = null
        let lastDate: string | null = null
        messages.forEach((message) => {
            const date = toLocalIsoDate(message.created_at)
            if (date !== lastDate) {
                combinedMessages.push(
                    <MessageGroupDate
                        date={message.created_at}
                        key={`date-${message.id}`}
                    />
                )
                lastDate = date
                lastSender = null
            }
            if (message.type === MessageTypeEnum.SYSTEM_ANNOUNCEMENT) {
                lastSender = null
                combinedMessages.push(
                    <SystemMessage
                        message={message}
                        key={message.id}
                    />
                )
                return
            }
            if (message.created_by_id !== lastSender) {
                combinedMessages.push(
                    <div
                        data-testid={`sender-${message.created_by_id}`}
                        data-sender={message.created_by_id}
                        key={`user-${message.id}`}
                    />
                )
                lastSender = message.created_by_id
            }
            combinedMessages.push(
                <Message
                    message={message}
                    key={message.id}
                />
            )
        })
        return combinedMessages
    }
    const combinedMessages = combineMessages(messages)
    const isEmpty = (!isLoading && !canFetchNext && !messages.length)
    return (
        <div className="message-list">
            {
                isEmpty
                && (
                    <div className="flex flex-1 h-full justify-center items-center">
                        <b>
                            No messages yet
                        </b>
                    </div>
                )
            }
            <div
                className="message-list-container"
                data-testid="container"
            >
                {
                    !isLoading && canFetchNext &&
                    <Intersection
                        onIntersect={fetchNext}
                    />
                }
                { combinedMessages }
            </div>
        </div>
    )
}


export default MessageList
