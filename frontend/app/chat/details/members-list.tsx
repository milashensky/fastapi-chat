import type { RoomRole } from '~/chat/types'
import ChatMember from './chat-member'


interface Props {
    chatMembers: RoomRole[],
}
const MembersList = (props: Props) => {
    return (
        <div className="py-2">
            {
                props.chatMembers.map((member) => (
                    <ChatMember
                        key={member.id}
                        member={member}
                    />
                ))
            }
        </div>
    )
}

export default MembersList
