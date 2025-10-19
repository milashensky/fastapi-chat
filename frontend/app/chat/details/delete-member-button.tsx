import type { RoomRole } from '~/chat/types'
import Button from '~/ui-kit/button'
import Icon from '~/ui-kit/icon'


interface Props {
    member: RoomRole,
}

const DeleteMemberButton = (props: Props) => {
    return (
        <Button
            icon
            color="danger"
        >
            <Icon
                icon="delete"
            />
        </Button>
    )
}

export default DeleteMemberButton
