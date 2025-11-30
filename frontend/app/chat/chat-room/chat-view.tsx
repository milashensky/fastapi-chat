import {
    chatRoomContext,
    useChatRoomContext,
    ChatRoomStateEnum,
} from './chat-room-context'
import MessageList from './message-list'
import MessageInputForm from './message-input-form'
import EditMessageHeader from './edit-message-header'
import ChatDetailsBar from './chat-details-bar'
import SubrouteLayout from './subroute-layout'
import type { Route } from '../+types/layout'


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
    const { roomId } = props.loaderData
    const context = useChatRoomContext({ roomId })
    const { state, editingMessage } = context
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
                    {
                        (state !== ChatRoomStateEnum.SEARCH) && (
                            <div className="message-input-area">
                                {editingMessage && <EditMessageHeader />}
                                <MessageInputForm />
                            </div>
                        )
                    }
                </div>
            </SubrouteLayout>
        </chatRoomContext.Provider>
    )
}

export default ChatView
