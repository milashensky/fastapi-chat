export interface AlreadyInRoomDetail {
    message: string
    chat_room_id: number
}

export class AlreadyInRoomError extends Error {
    public chatRoomId: number

    constructor(message: string, chatRoomId: number) {
        super(message)
        this.name = 'AlreadyInRoomError'
        this.chatRoomId = chatRoomId
    }
}

export class InviteExpiredError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'InviteExpiredError'
    }
}