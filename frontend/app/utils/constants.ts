import type { DeletedUser } from '~/auth/types'


export const DEFAULT_PAGE = '/'

export const CHAT_NAME_MIN_LENGTH = 3

// 5 min before expiry
export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000

export const CHAT_BASE_ROUTE = '/chat'

export const ROOT_ROUTE = '/'

export const CHAT_INVITE_BASE_ROUTE = '/invite'

export const DELETED_USER: DeletedUser = {
    id: null,
    name: 'Deleted user',
}
