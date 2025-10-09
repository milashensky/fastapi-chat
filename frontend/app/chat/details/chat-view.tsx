import { useMessagesStore } from "~/chat/messages-store"
import type { Route } from "../+types/layout"
import { chatRoomContext } from "./chat-room-context"
import MessageList from "./message-list"
import ChatInputForm from "./chat-inpit-form"

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
    const createMessage = useMessagesStore((state) => state.create)
    const { roomId } = props.loaderData
    const sendMessage = async (message: string) => {
        await createMessage({
            content: message,
        }, {
            roomId,
        })
    }
    const context = {
        roomId,
        sendMessage,
    }
    return (
        <chatRoomContext.Provider
            value={context}
        >
            <div className="flex flex-col flex-1 h-screen overflow-hidden">
                <div>
                    top
                </div>
                <div className="flex-1 h-full overflow-hidden">
                    <MessageList />
                </div>
                <ChatInputForm />
            </div>
        </chatRoomContext.Provider>
    )
}

export default ChatView
