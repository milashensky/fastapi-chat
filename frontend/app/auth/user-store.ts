import { create } from "zustand";
import { combine } from 'zustand/middleware'
import type { User } from "./types"
import { useModel } from "~/utils/useModel"

export const useUserStore = create(
    combine(
        {
            users: {} as {[pk: User['id']]: User | null},
        },
        (set, get) => {
            const storeUser = (userId: User['id'], user: User | null) => {
                set((state) => ({
                    users: {
                        ...state.users,
                        [userId]: user,
                    },
                }))
            }
            const unstoreUser = (userId: User['id']) => {
                const { users } = get()
                delete users[userId]
                set(() => ({
                    users,
                }))
            }
            const {
                getOrFetch,
                fetch,
            } = useModel<User, User['id']>({
                baseUrl: '/api/auth/user',
                storeItem: storeUser,
                deleteItem: unstoreUser,
                getItem: (userId: User['id']): User | null | undefined => {
                    const { users } = get()
                    return users[userId]
                },
            })
            return {
                getOrFetch,
                fetch,
                storeUser,
                unstoreUser,
            }
        },
    ),
)
