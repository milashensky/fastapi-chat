import { useState } from "react"
import type { ChatRoom, CreateChatForm } from "~/chat/types"
import { useChatsStore } from "~/chat/chats-store"
import type { FormErrors } from "~/globals/types"
import { BadResponseError } from "~/utils/request"
import { toValue, type MaybeRef } from "~/utils/stateRef"

interface Options {
    name: MaybeRef<string>
    actions?: {
        validate?: () => boolean,
        onSuccess?: (chat: ChatRoom) => void
        submit?: () => Promise<void>
    }
}

export type ResponseErrors = FormErrors<CreateChatForm>

export const useCreateChat = (options: Options) => {
    const [errors, setErrors] = useState<ResponseErrors>({})
    const [isPending, setPending] = useState(false)
    const actions = {
        validate: () => true,
        onSuccess: () => {},
        async submit(): Promise<void> {
            setErrors({})
            const isValid = actions.validate()
            if (!isValid) {
                return
            }
            setPending(true)
            try {
                const chat = await useChatsStore.getState().create({
                    name: toValue(options.name),
                })
                actions.onSuccess(chat)
            } catch (e) {
                if (e instanceof BadResponseError) {
                    setErrors(e.errors as ResponseErrors)
                }
            } finally {
                setPending(false)
            }
        },
        ...options.actions,
    }
    return {
        errors,
        isPending,
        ...actions,
    }
}
