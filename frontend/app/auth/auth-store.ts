import { create } from "zustand";
import type {
    AccessToken,
    LoginCredentials,
    RegistrationForm,
    User,
} from "./types";
import axios from "axios";
import { useUserStore } from "./user-store";
import { createJSONStorage, persist } from "zustand/middleware";

interface CurrentUserResponse {
    user: User
    access_token: AccessToken
}

interface AuthStore {
    userId: User['id'] | null,
    accessToken: AccessToken | null,
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => void
    refreshAccessToken: () => Promise<void>
    fetchCurrentUser: () => Promise<void>
    registerUser: (userData: RegistrationForm) => Promise<void>
}

export const useAuthStore = create(
    persist<AuthStore>(
        (set) => {
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
                userId: null,
                accessToken: null,
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
                async registerUser(userData: RegistrationForm) {
                    const response = await axios.post<CurrentUserResponse>('/api/auth/registration', userData)
                    setCurrentUser(response.data)
                },
            }
        },
        {
            name: 'auth-store',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)
