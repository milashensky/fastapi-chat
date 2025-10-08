import { create } from "zustand";
import { combine } from 'zustand/middleware'
import type { IdModelTable } from "~/globals/types";
import { useModel, type ModelDefenition } from "~/utils/useModel"
import type { User } from "./types"

interface UserDefenition extends ModelDefenition<User> {
    ItemPk: User['id']
}

export const useUserStore = create(
    combine(
        {
            users: {} as IdModelTable<User>,
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
            } = useModel<User, UserDefenition>({
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
