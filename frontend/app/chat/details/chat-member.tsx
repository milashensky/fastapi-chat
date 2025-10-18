import { useUser } from '~/auth/use-user'
import {
    RoomRoleEnum,
    type RoomRole,
} from '~/chat/types'
import SkeletonLoader from '~/ui-kit/skeleton-loader'
import './styles/chat-member.scss'


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
        <div className="chat-member">
            {
                user
                    ? (
                        <h5 className="chat-member-name">
                            {user.name}
                        </h5>
                    )
                    : <SkeletonLoader />
            }
            {
                isAdmin &&
                <small className="chat-member-role">
                    Admin
                </small>
            }
            {
                isModerator &&
                <small className="chat-member-role">
                    Moderator
                </small>
            }
        </div>
    )
}

export default ChatMember
