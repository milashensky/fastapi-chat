export enum RoomRoleEnum {
    ADMIN = 'admin',
    MODERATOR = 'mod',
    USER = 'user',
}

export interface RoomRole {
    id: number
    user_id: number
    chat_room_id: number
    role: RoomRoleEnum
}

export interface ChatRoom {
    id: number
    name: string
    roles: RoomRole[]
}

export interface CreateChatForm {
    name: string
}

export type UpdateChatForm = Partial<CreateChatForm>

export enum MessageTypeEnum {
    TEXT = 'text',
    SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export interface ChatMessage {
    id: number
    content: string
    type: MessageTypeEnum
    chat_room_id: number
    created_by_id: number | null
    created_at: string
    updated_at: string | null
}

export interface CreateMessageForm {
    content: string
}

export type UpdateMessageForm = Partial<CreateMessageForm>

export interface ChatRoomInvite {
    id: string
}
