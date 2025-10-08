import Textarea from "~/ui-kit/textarea"
import type { Route } from "../+types/layout"
import Button from "~/ui-kit/button"

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
    return (
        <div className="flex flex-col flex-1 h-full">
            <div>
                top
            </div>
            <div className="flex-1 h-full">
                Main chat view:
                { props.loaderData.params.roomId }
            </div>
            <div className="d-flex">
                <Textarea
                    name="message"
                />
                <Button>
                    send
                </Button>
            </div>
        </div>
    )
}

export default ChatView
