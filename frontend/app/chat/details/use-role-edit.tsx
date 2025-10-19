import { useState } from 'react'
import type { RoomRole, RoomRoleEnum } from '~/chat/types'


interface Options {
    roomRoleId: RoomRole['id']
    role: RoomRoleEnum
    actions?: {
        validate?: () => boolean
        onSuccess?: () => void
        submit?: () => Promise<void>
    },
}

export const useRoleEdit = (options: Options) => {
    const [isPending, setPending] = useState(false)
    const actions = {
        validate() {
            return true
        },
        onSuccess() {
            return
        },
        submit() {
            const isValid = actions.validate()
            if (!isValid) {
                return
            }
            setPending(true)
            actions.onSuccess()
        },
        ...options.actions,
    }
    return {
        isPending,
        ...actions,
    }
}
