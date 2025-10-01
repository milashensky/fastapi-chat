export interface User {
    id: number
    name?: string
    email: string
}

export interface AccessToken {
    token: string
    token_type: 'Bearer'
    expires_at: number
}

export interface LoginCredentials {
    email: string
    password: string
}
