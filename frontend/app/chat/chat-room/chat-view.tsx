import { useMessagesStore } from '~/chat/messages-store'
import type { Route } from '../+types/layout'
import { chatRoomContext } from './chat-room-context'
import MessageList from './message-list'
import MessageInputForm from './message-input-form'
import ChatDetailsBar from './chat-details-bar'
import SubrouteLayout from './subroute-layout'


interface Props {
    loaderData: {
        roomId: number,
    },
}

export async function clientLoader(args: Route.ClientLoaderArgs) {
    const roomId = parseInt(args.params.roomId || '0')
    return {
        roomId,
    }
}

const ChatView = (props: Props) => {
    const createMessage = useMessagesStore((state) => state.create)
    const {
        roomId,
    } = props.loaderData
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
            <SubrouteLayout>
                <div className="flex flex-col flex-1 h-screen overflow-hidden">
                    <ChatDetailsBar />
                    <div className="flex-1 h-full overflow-hidden">
                        <MessageList />
                    </div>
                    <MessageInputForm />
                </div>
            </SubrouteLayout>
        </chatRoomContext.Provider>
    )
}

export default ChatView
