import { useState } from 'react'
import type {
    ChatRoom,
    UpdateChatForm,
} from '~/chat/types'
import { useChatsStore } from '../chats-store'
import { BadResponseError } from '~/utils/request'
import type { FormErrors } from '~/globals/types'


interface Options {
    roomId: ChatRoom['id']
    form: UpdateChatForm,
    actions?: {
        validate?: () => boolean
        onSuccess?: () => void
        submit?: () => Promise<void>
    },
}

type Errors = FormErrors<UpdateChatForm>

export const useChatEdit = (options: Options) => {
    const [isPending, setPending] = useState(false)
    const [errors, setErrors] = useState<Errors>({})
    const updateChat = useChatsStore((state) => state.update)
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
                roomId,
                form,
            } = options
            setPending(true)
            try {
                await updateChat(roomId, form)
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
