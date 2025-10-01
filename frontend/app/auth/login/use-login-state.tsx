import { useStateRef, type MaybeRef } from "~/utils/stateRef"

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
            return false
        },
        async submit() {
            const isValid = actions.validate()
            if (!isValid) {
                return
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
