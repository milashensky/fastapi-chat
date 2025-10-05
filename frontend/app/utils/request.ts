import axios, { type AxiosResponse } from "axios"
import { useAuthStore } from "~/auth/auth-store"

export type ResponseErrors = unknown

export class BadResponseError extends Error {
    response: AxiosResponse
    errors: ResponseErrors | null = null

    constructor(response: AxiosResponse) {
        super()
        this.response = response
        this.errors = response.data
    }
}

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
            switch (statusCode) {
                case 400:
                    throw new BadResponseError(error.response)
                case 401:
                    useAuthStore.getState().logout()
                    break
            }
            return Promise.reject(error)
        }
    )
}
