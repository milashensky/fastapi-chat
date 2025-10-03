import axios from "axios"
import { useAuthStore } from "~/auth/auth-store"

export const setupRequest = () => {
    axios.interceptors.request.use((config) => {
        const { accessToken } = useAuthStore.getState()
        config.headers.Authorization = accessToken ? `${accessToken.token_type} ${accessToken.token}` : null
        return config
    })
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (!error.response) {
                return Promise.reject(error)
            }
            const statusCode = error.response.status;
            if (statusCode === 401) {
                useAuthStore.getState().logout()
            }
            return Promise.reject(error)
        }
    )
}
