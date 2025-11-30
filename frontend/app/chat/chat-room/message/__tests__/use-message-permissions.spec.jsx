import { useAuthStore } from '~/auth/auth-store'
import { useChatsStore } from '~/chat/chats-store'
import { RoomRoleEnum } from '~/chat/types'
import { textMessageFactory } from '~/test/factories/chatMessage'
import { chatRoomFactory } from '~/test/factories/chatRoom'
import { roomRoleFactory } from '~/test/factories/roomRole'
import { describeHook } from '~/test/unit/hookTest'
import { useMessagePermissions } from '../use-message-permissions'


vi.mock('zustand')

describeHook('useMessagePermissions', ({ mountHook }) => {
    it('should return false for both when user is not authenticated', () => {
        const room = chatRoomFactory()
        const message = textMessageFactory({ chat_room_id: room.id })
        useAuthStore.setState({ userId: null })
        useChatsStore.setState({ chatRooms: { [room.id]: room } })
        const permissions = mountHook({ message })
        expect(permissions.current.canEdit).toBe(false)
        expect(permissions.current.canDelete).toBe(false)
    })

    it('should return false for both when chat is not found', () => {
        const userId = 10
        const message = textMessageFactory({ created_by_id: userId })
        useAuthStore.setState({ userId })
        useChatsStore.setState({ chatRooms: {} })
        const permissions = mountHook({ message })
        expect(permissions.current.canEdit).toBe(false)
        expect(permissions.current.canDelete).toBe(false)
    })

    it('should allow edit and delete for message creator', () => {
        const userId = 10
        const role = roomRoleFactory({
            user_id: userId,
            role: RoomRoleEnum.USER,
        })
        const room = chatRoomFactory({
            id: role.chat_room_id,
            roles: [role],
        })
        const message = textMessageFactory({
            created_by_id: userId,
            chat_room_id: room.id,
        })
        useAuthStore.setState({ userId })
        useChatsStore.setState({ chatRooms: { [room.id]: room } })
        const permissions = mountHook({ message })
        expect(permissions.current.canEdit).toBe(true)
        expect(permissions.current.canDelete).toBe(true)
    })

    it('should not allow edit or delete for non-creator regular user', () => {
        const userId = 20
        const creatorId = 10
        const role = roomRoleFactory({
            user_id: userId,
            role: RoomRoleEnum.USER,
        })
        const room = chatRoomFactory({
            id: role.chat_room_id,
            roles: [role],
        })
        const message = textMessageFactory({
            created_by_id: creatorId,
            chat_room_id: room.id,
        })
        useAuthStore.setState({ userId })
        useChatsStore.setState({ chatRooms: { [room.id]: room } })
        const permissions = mountHook({ message })
        expect(permissions.current.canEdit).toBe(false)
        expect(permissions.current.canDelete).toBe(false)
    })

    it('should allow delete but not edit for admin on other user message', () => {
        const adminId = 20
        const creatorId = 10
        const role = roomRoleFactory({
            user_id: adminId,
            role: RoomRoleEnum.ADMIN,
        })
        const room = chatRoomFactory({
            id: role.chat_room_id,
            roles: [role],
        })
        const message = textMessageFactory({
            created_by_id: creatorId,
            chat_room_id: room.id,
        })
        useAuthStore.setState({ userId: adminId })
        useChatsStore.setState({ chatRooms: { [room.id]: room } })
        const permissions = mountHook({ message })
        expect(permissions.current.canEdit).toBe(false)
        expect(permissions.current.canDelete).toBe(true)
    })

    it('should allow delete but not edit for moderator on other user message', () => {
        const modId = 20
        const creatorId = 10
        const role = roomRoleFactory({
            user_id: modId,
            role: RoomRoleEnum.MODERATOR,
        })
        const room = chatRoomFactory({
            id: role.chat_room_id,
            roles: [role],
        })
        const message = textMessageFactory({
            created_by_id: creatorId,
            chat_room_id: room.id,
        })
        useAuthStore.setState({ userId: modId })
        useChatsStore.setState({ chatRooms: { [room.id]: room } })
        const permissions = mountHook({ message })
        expect(permissions.current.canEdit).toBe(false)
        expect(permissions.current.canDelete).toBe(true)
    })

    it('should allow both edit and delete for admin on own message', () => {
        const adminId = 10
        const role = roomRoleFactory({
            user_id: adminId,
            role: RoomRoleEnum.ADMIN,
        })
        const room = chatRoomFactory({
            id: role.chat_room_id,
            roles: [role],
        })
        const message = textMessageFactory({
            created_by_id: adminId,
            chat_room_id: room.id,
        })
        useAuthStore.setState({ userId: adminId })
        useChatsStore.setState({ chatRooms: { [room.id]: room } })
        const permissions = mountHook({ message })
        expect(permissions.current.canEdit).toBe(true)
        expect(permissions.current.canDelete).toBe(true)
    })

    it('should return false for user not in room roles', () => {
        const userId = 30
        const otherUserId = 10
        const role = roomRoleFactory({
            user_id: otherUserId,
            role: RoomRoleEnum.USER,
        })
        const room = chatRoomFactory({
            id: role.chat_room_id,
            roles: [role],
        })
        const message = textMessageFactory({
            created_by_id: otherUserId,
            chat_room_id: room.id,
        })
        useAuthStore.setState({ userId })
        useChatsStore.setState({ chatRooms: { [room.id]: room } })
        const permissions = mountHook({ message })
        expect(permissions.current.canEdit).toBe(false)
        expect(permissions.current.canDelete).toBe(false)
    })
}, {
    constructor: useMessagePermissions,
})
