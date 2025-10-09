import { useEffect } from "react"
import { useShallow } from "zustand/shallow"
import { useUserStore } from "~/auth/user-store"
import type { User, DeletedUser } from "./types"
import { DELETED_USER } from "~/utils/constants"

interface Options {
    userId: User['id'] | null
}

export const useUser = ({ userId }: Options): User | DeletedUser | null => {
    const getOrFetchUser = useUserStore((state) => state.getOrFetch)
    useEffect(() => {
        if (userId === null) {
            return
        }
        getOrFetchUser(userId)
    }, [userId])
    const user = useUserStore(useShallow((state) => {
        if (userId === null) {
            return DELETED_USER
        }
        return state.users[userId] || null
    }))
    return user
}
