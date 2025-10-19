import { useUser } from '~/auth/use-user'
import ChatRoleRequired from '~/chat/access/chat-role-required'
import {
    RoomRoleEnum,
    type RoomRole,
} from '~/chat/types'
import SkeletonLoader from '~/ui-kit/skeleton-loader'
import DeleteMemberButton from './delete-member-button'
import './styles/chat-member.scss'
import Icon from '~/ui-kit/icon'
import Button from '~/ui-kit/button'
import { useState } from 'react'
import EditRoleForm from './edit-role-form'
import { useAuthStore } from '~/auth/auth-store'


interface Props {
    member: RoomRole,
}

const ChatMember = (props: Props) => {
    const [isEdit, setEdit] = useState(false)
    const { member } = props
    const user = useUser({
        userId: member.user_id,
    })
    const isAdmin = (member.role === RoomRoleEnum.ADMIN)
    const isModerator = (member.role === RoomRoleEnum.MODERATOR)
    if (isEdit) {
        return (
            <EditRoleForm
                member={member}
                onBack={() => setEdit(false)}
            />
        )
    }
    const currentUserId = useAuthStore((state) => state.userId)
    const isCurrentUser = (member.user_id === currentUserId)
    return (
        <div className="flex justify-between items-center">
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
            <div className="flex items-center gap-2">
                <ChatRoleRequired
                    roomId={member.chat_room_id}
                    allowFor={[RoomRoleEnum.ADMIN]}
                >
                    <Button
                        icon
                        color="secondary"
                        onClick={() => setEdit(true)}
                    >
                        <Icon
                            icon="edit"
                        />
                    </Button>
                </ChatRoleRequired>
                {
                    // current user can't delete their role, there's leave button for this
                    isCurrentUser
                    || (
                        <ChatRoleRequired
                            roomId={member.chat_room_id}
                            allowFor={[RoomRoleEnum.ADMIN, RoomRoleEnum.MODERATOR]}
                        >
                            <DeleteMemberButton
                                member={member}
                            />
                        </ChatRoleRequired>
                    )
                }
            </div>
        </div>
    )
}

export default ChatMember
