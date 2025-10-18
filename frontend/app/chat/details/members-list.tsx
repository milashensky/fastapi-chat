import type { RoomRole } from "~/chat/types"
import ChatMember from "./chat-member"

interface Props {
    chatMembers: RoomRole[],
}
const MembersList = (props: Props) => {
    return (
        <div>
            {
                props.chatMembers.map((member) => (
                    <ChatMember
                        member={member}
                    />
                ))
            }
        </div>
    )
}

export default MembersList
