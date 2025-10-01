import { create } from "zustand";
import type { AccessToken, LoginCredentials, User } from "./types";
import axios from "axios";

export const useAuthStore = create((set) => ({
    user: null as User | null,
    accessToken: null as AccessToken | null,
    login: async (credentials: LoginCredentials) => {
        const response = await axios.post<{
            user: User,
            access_token: AccessToken,
        }>('/api/auth/login', credentials)
        const {
            user,
            access_token: accessToken,
        } = response.data
        set(() => ({
            user,
            accessToken,
        }))
    },
    logout: () => {
        set(() => ({
            user: null,
            accessToken: null,
        }))
    },
    refreshAccessToken: async () => {
        const response = await axios.post<{
            user: User,
            access_token: AccessToken,
        }>('/api/auth/token')
        const {
            access_token: accessToken,
        } = response.data
        set(() => ({
            accessToken,
        }))
    },
}))
