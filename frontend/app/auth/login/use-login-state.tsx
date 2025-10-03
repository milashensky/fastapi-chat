import { toValue, useStateRef, type MaybeRef } from "~/utils/stateRef"
import { useAuthStore } from "../auth-store"

export interface Options {
    email: MaybeRef<string>
    password: MaybeRef<string>
    actions?: {
        validate?: () => boolean,
        submit?: () => Promise<void>,
    }
}

export const useLoginState = (options: Options) => {
    const isPending = useStateRef(false)
    const errors = useStateRef({
        password: [] as string[],
        email: [] as string[],
    })
    const actions = {
        validate(): boolean {
            return true
        },
        async submit() {
            const isValid = actions.validate()
            if (!isValid) {
                return
            }
            await useAuthStore.getState().login({
                email: toValue(options.email),
                password: toValue(options.password),
            })
        },
        ...options.actions,
    }
    return {
        isPending,
        errors,
        ...actions,
    }
}
