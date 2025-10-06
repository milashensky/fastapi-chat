import { useAuthStore } from "~/auth/auth-store"
import type { FormErrors } from "~/globals/types"
import type { LoginCredentials } from "~/auth/types"
import { BadResponseError } from "~/utils/request"
import { toValue, useStateRef, type MaybeRef } from "~/utils/stateRef"

export interface Options {
    email: MaybeRef<string>
    password: MaybeRef<string>
    actions?: {
        validate?: () => boolean,
        submit?: () => Promise<void>,
    }
}

type Errors = FormErrors<LoginCredentials>

export const useLoginState = (options: Options) => {
    const isPending = useStateRef(false)
    const errors = useStateRef<Errors>({})
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
