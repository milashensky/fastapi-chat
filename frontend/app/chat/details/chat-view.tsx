import { useMessagesStore } from "~/chat/messages-store"
import Textarea from "~/ui-kit/textarea"
import type { Route } from "../+types/layout"
import Button from "~/ui-kit/button"
import { useState } from "react"

interface Props {
    loaderData: {
        params: {
            roomId: number,
        },
    },
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    return { params }
}

const ChatView = (props: Props) => {
    const [message, setMessage] = useState('')
    const createMessage = useMessagesStore((state) => state.create)
    const { roomId } = props.loaderData.params
    const sendMessage = async () => {
        await createMessage({
            content: message,
        }, {
            roomId,
        })
        setMessage('')
    }
    return (
        <div className="flex flex-col flex-1 h-full">
            <div>
                top
            </div>
            <div className="flex-1 h-full">
                Main chat view:
                { roomId }
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
    )
}

export default ChatView
