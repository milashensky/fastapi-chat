import { useUser } from "~/auth/use-user"
import {
    RoomRoleEnum,
    type RoomRole,
} from "~/chat/types"
import SkeletonLoader from "~/ui-kit/skeleton-loader"

interface Props {
    member: RoomRole,
}
const ChatMember = (props: Props) => {
    const { member } = props
    const user = useUser({
        userId: member.user_id,
    })
    const isAdmin = (member.role === RoomRoleEnum.ADMIN)
    const isModerator = (member.role === RoomRoleEnum.MODERATOR)
    return (
        <div>
            {
                user
                ? (
                    <h5>
                        {user.name}
                    </h5>
                )
                : <SkeletonLoader />
            }
            {
                isAdmin &&
                <small>
                    Admin
                </small>
            }
            {
                isModerator &&
                <small>
                    Moderator
                </small>
            }
        </div>
    )
}

export default ChatMember
