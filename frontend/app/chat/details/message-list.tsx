import { useContext, useState } from "react"
import { chatRoomContext } from "./chat-room-context"
import { useRoomMessages } from "./use-room-messages"
import Intersection from "~/ui-kit/intersection"

import './styles/message-list.scss'

const MessageList = () => {
    const { roomId } = useContext(chatRoomContext)
    const [search, setSearch] = useState('')
    const {
        isLoading,
        messages,
        canFetchNext,
        fetchNext,
    } = useRoomMessages({
        roomId,
        search,
    })
    return (
        <div className="message-list">
            {
                !isLoading && canFetchNext &&
                <Intersection
                    onIntersect={fetchNext}
                />
            }
            {messages.map((message) => (
                <div
                    key={message.id}
                >
                    {message.content}
                </div>
            ))}
        </div>
    )
}


export default MessageList
