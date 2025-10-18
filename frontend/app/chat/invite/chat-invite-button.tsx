import { useState } from "react"
import Button from "~/ui-kit/button"
import { CHAT_INVITE_BASE_ROUTE } from "~/utils/constants"
import { useChatsStore } from "../chats-store"

interface Props {
    roomId: number
}

const ChatInviteButton = ({ roomId }: Props) => {
    const [isPending, setPending] = useState(false)
    const createChatInvite = useChatsStore((state) => state.createChatInvite)
    const copyInviteLink = async () => {
        setPending(true)
        try {
            const invite = await createChatInvite(roomId)
            const link = `${window.location.origin}${CHAT_INVITE_BASE_ROUTE}/${invite.id}`
            window.navigator.clipboard.writeText(link)
            // TODO: alert
        } finally {
            setPending(false)
        }
    }
    return (
        <Button
            disabled={isPending}
            onClick={copyInviteLink}
        >
            Invite more people
        </Button>
    )
}
export default ChatInviteButton
