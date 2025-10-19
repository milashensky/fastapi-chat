import { useState } from 'react'
import type { RoomRole } from '~/chat/types'
import { useChatsStore } from '~/chat/chats-store'
import Button from '~/ui-kit/button'
import ConfirmationDialog from '~/ui-kit/confirmation-dialog'
import Icon from '~/ui-kit/icon'


interface Props {
    member: RoomRole,
}

const DeleteMemberButton = (props: Props) => {
    const { member } = props
    const [isConfirmShown, setConfirmShown] = useState(false)
    const deleteRoomRole = useChatsStore((state) => state.deleteRoomRole)
    const deleteRole = async () => {
        await deleteRoomRole(member.id)
    }
    return (
        <div className="contents">
            <Button
                icon
                color="danger"
                onClick={() => setConfirmShown(true)}
            >
                <Icon
                    icon="delete"
                />
            </Button>
            <ConfirmationDialog
                color="danger"
                content="You will be able to invite user back in the room later. All their messages will remain."
                isShown={isConfirmShown}
                onConfirm={deleteRole}
                onClose={() => setConfirmShown(false)}
            />
        </div>
    )
}

export default DeleteMemberButton
