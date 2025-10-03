import axios from "axios"
import { useAuthStore } from "~/auth/auth-store"

export const setupRequest = () => {
    axios.interceptors.request.use((config) => {
        const { accessToken } = useAuthStore.getState()
        config.headers.Authorization = accessToken ? `${accessToken.token_type} ${accessToken.token}` : null
        return config
    })
}
