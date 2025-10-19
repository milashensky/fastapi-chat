import { useState } from 'react'
import type {
    RoomRole,
    RoomRoleEnum,
    UpdateRoomRoleForm,
} from '~/chat/types'
import { useChatsStore } from '../chats-store'
import { BadResponseError } from '~/utils/request'
import type { FormErrors } from '~/globals/types'


interface Options {
    roomRoleId: RoomRole['id']
    role: RoomRoleEnum
    actions?: {
        validate?: () => boolean
        onSuccess?: () => void
        submit?: () => Promise<void>
    },
}

type Errors = FormErrors<UpdateRoomRoleForm>

export const useRoleEdit = (options: Options) => {
    const [isPending, setPending] = useState(false)
    const [errors, setErrors] = useState<Errors>({})
    const updateRoomRole = useChatsStore((state) => state.updateRoomRole)
    const actions = {
        validate() {
            return true
        },
        onSuccess() {
            return
        },
        async submit() {
            const isValid = actions.validate()
            if (!isValid) {
                return
            }
            const {
                roomRoleId,
                role,
            } = options
            setPending(true)
            try {
                await updateRoomRole(roomRoleId, { role })
                actions.onSuccess()
            }
            catch (e) {
                if (e instanceof BadResponseError) {
                    setErrors(e.errors as Errors)
                }
            }
            finally {
                setPending(false)
            }
        },
        ...options.actions,
    }
    return {
        isPending,
        errors,
        ...actions,
    }
}
