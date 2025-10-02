import { create } from "zustand";
import type { AccessToken, LoginCredentials, User } from "./types";
import axios from "axios";
import { useUserStore } from "./user-store";

interface CurrentUserResponse {
    user: User
    access_token: AccessToken
}

export const useAuthStore = create((set) => {
    const setCurrentUser = (responseData: CurrentUserResponse) => {
        const {
            user,
            access_token: accessToken,
        } = responseData
        set(() => ({
            userId: user.id,
            accessToken,
        }))
        const { storeUser } = useUserStore.getState()
        storeUser(user.id, user)
    }
    return {
        userId: null as User['id'] | null,
        accessToken: null as AccessToken | null,
        async login(credentials: LoginCredentials) {
            const response = await axios.post<CurrentUserResponse>('/api/auth/login', credentials)
            setCurrentUser(response.data)
        },
        logout() {
            set(() => ({
                userId: null,
                accessToken: null,
            }))
        },
        async refreshAccessToken() {
            const response = await axios.post<AccessToken>('/api/auth/token')
            set(() => ({
                accessToken: response.data,
            }))
        },
        async fetchCurrentUser() {
            const response = await axios.get<CurrentUserResponse>('/api/auth/me')
            setCurrentUser(response.data)
        },
    }
})
