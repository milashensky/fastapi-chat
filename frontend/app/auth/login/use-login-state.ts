import { toValue, useStateRef, type MaybeRef } from "~/utils/stateRef"
import { useAuthStore } from "../auth-store"
import { BadResponseError } from "~/utils/request"

export interface Options {
    email: MaybeRef<string>
    password: MaybeRef<string>
    actions?: {
        validate?: () => boolean,
        submit?: () => Promise<void>,
    }
}

export interface Errors {
    __all__: string[]
    email: string[]
    password: string[]
}

export const useLoginState = (options: Options) => {
    const isPending = useStateRef(false)
    const errors = useStateRef<Partial<Errors>>({})
    const actions = {
        validate(): boolean {
            return true
        },
        async submit() {
            const isValid = actions.validate()
            if (!isValid) {
                return
            }
            isPending.current = true
            try {
                await useAuthStore.getState().login({
                    email: toValue(options.email),
                    password: toValue(options.password),
                })
                errors.current = {}
            } catch (e) {
                if (e instanceof BadResponseError) {
                    errors.current = e.errors as Errors
                }
            } finally {
                isPending.current = false
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
