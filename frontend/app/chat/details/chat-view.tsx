import { useState } from "react"
import { useMessagesStore } from "~/chat/messages-store"
import Textarea from "~/ui-kit/textarea"
import type { Route } from "../+types/layout"
import Button from "~/ui-kit/button"
import { chatRoomContext } from "./chat-room-context"
import MessageList from "./message-list"

interface Props {
    loaderData: {
        roomId: number,
    },
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    const roomId = parseInt(params.roomId || '0')
    return { roomId }
}

const ChatView = (props: Props) => {
    const [message, setMessage] = useState('')
    const createMessage = useMessagesStore((state) => state.create)
    const { roomId } = props.loaderData
    const sendMessage = async () => {
        await createMessage({
            content: message,
        }, {
            roomId,
        })
        setMessage('')
    }
    return (
        <chatRoomContext.Provider
            value={{ roomId }}
        >
            <div className="flex flex-col flex-1 h-full">
                <div>
                    top
                </div>
                <div className="flex-1 h-full overflow-hidden">
                    <MessageList />
                </div>
                <div className="d-flex">
                    <Textarea
                        value={message}
                        name="message"
                        onInput={setMessage}
                    />
                    <Button
                        onClick={sendMessage}
                    >
                        send
                    </Button>
                </div>
            </div>
        </chatRoomContext.Provider>
    )
}

export default ChatView
