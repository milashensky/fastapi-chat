export interface User {
    id: number
    name?: string
}

export interface DeletedUser {
    id: null
    name: 'Deleted user'
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

export interface RegistrationForm {
    name: string
    email: string
    password: string
}
