import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useChatsStore } from "../chats-store"
import { CHAT_BASE_ROUTE } from "~/utils/constants"
import type { Route } from "./+types/accept-invite"
import { AlreadyInRoomError, InviteExpiredError } from "~/chat/invite-errors"

interface Props {
    loaderData: {
        inviteId: string
    },
}

export const clientLoader = async (args: Route.ClientLoaderArgs) => {
    const inviteId = args.params.inviteId || '0'
    return {
        inviteId,
    }
}

const AcceptInvite = (props: Props) => {
    const {
        inviteId,
    } = props.loaderData
    const [isExpired, setExpired] = useState(false)
    const [isPending, setPending] = useState(true)
    const navigate = useNavigate()
    const acceptChatInvite = useChatsStore((state) => state.acceptChatInvite)
    const navigateToRoom = (roomId: number) => {
        navigate(`${CHAT_BASE_ROUTE}/${roomId}`)
    }
    const acceptInvite = async () => {
        setPending(true)
        setExpired(false)
        try {
            const chatRoom = await acceptChatInvite(inviteId)
            navigateToRoom(chatRoom.id)
        } catch (e) {
            if (e instanceof AlreadyInRoomError) {
                navigateToRoom(e.chatRoomId)
                return
            }
            if (e instanceof InviteExpiredError) {
                setExpired(true)
                return
            }
        } finally {
            setPending(false)
        }
    }
    useEffect(() => {
        acceptInvite()
    }, [inviteId])
    if (isPending) {
        return (
            <div>
                ...
            </div>
        )
    }
    if (isExpired) {
        return (
            <div>
                Invite is expired
            </div>
        )
    }
    return (
        <div>
            Failed to accept the invite
        </div>
    )
}

export default AcceptInvite
