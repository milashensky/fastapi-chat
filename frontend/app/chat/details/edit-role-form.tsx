import { useRef, useState } from 'react'
import { useUser } from '~/auth/use-user'
import { RoomRoleEnum, type RoomRole } from '~/chat/types'
import Button from '~/ui-kit/button'
import Form, { type FormRef } from '~/ui-kit/form'
import Icon from '~/ui-kit/icon'
import Select from '~/ui-kit/select'
import { useRoleEdit } from './use-role-edit'


interface Props {
    member: RoomRole
    onBack: () => void
}

const roleOptions = [
    {
        value: RoomRoleEnum.USER,
        label: 'User',
    },
    {
        value: RoomRoleEnum.MODERATOR,
        label: 'Moderator',
    },
    {
        value: RoomRoleEnum.ADMIN,
        label: 'Admin',
    },
]

const EditRoleForm = (props: Props) => {
    const {
        onBack,
        member,
    } = props
    const [role, setRole] = useState<RoomRoleEnum>(member.role)
    const formRef = useRef<FormRef>(null)
    const validate = (): boolean => {
        const isValid = formRef.current?.validate()
        return Boolean(isValid)
    }
    const {
        submit,
        errors,
        isPending,
    } = useRoleEdit({
        roomRoleId: member.id,
        role,
        actions: {
            onSuccess: onBack,
            validate,
        },
    })
    const user = useUser({
        userId: member.user_id,
    })
    return (
        <Form
            ref={formRef}
            className="flex justify-between items-center gap-2"
            onSubmit={submit}
        >
            <div className="flex flex-col flex">
                <p>
                    {user?.name}
                </p>
                <Select
                    placeholder="Select role"
                    name="role"
                    data-testid="role-select"
                    disabled={isPending}
                    value={role}
                    errors={errors.role}
                    options={roleOptions}
                    onChange={(value) => setRole(value)}
                />
            </div>
            <div className="flex gap-2">
                <Button
                    icon
                    disabled={isPending}
                    data-testid="submit"
                    type="submit"
                >
                    <Icon
                        icon="accept"
                    />
                </Button>
                <Button
                    icon
                    type="reset"
                    color="secondary"
                    data-testid="reset"
                    disabled={isPending}
                    onClick={onBack}
                >
                    <Icon
                        icon="close"
                    />
                </Button>
            </div>
        </Form>
    )
}

export default EditRoleForm
