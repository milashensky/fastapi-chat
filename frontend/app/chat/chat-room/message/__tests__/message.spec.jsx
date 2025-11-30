import { act, fireEvent } from '@testing-library/react'
import { describeComponent } from '~/test/unit/componentTest'
import { textMessageFactory } from '~/test/factories/chatMessage'
import { chatRoomFactory } from '~/test/factories/chatRoom'
import { roomRoleFactory } from '~/test/factories/roomRole'
import { RoomRoleEnum } from '~/chat/types'
import { useAuthStore } from '~/auth/auth-store'
import { useChatsStore } from '~/chat/chats-store'
import { chatRoomContext } from '../../chat-room-context'
import Message from '../message'


describeComponent('Message', ({ render }) => {
    const setEditingMessageId = vi.fn()

    const renderMessage = (message, { userId = 10 } = {}) => {
        const role = roomRoleFactory({
            user_id: userId,
            chat_room_id: message.chat_room_id,
            role: RoomRoleEnum.USER,
        })
        const room = chatRoomFactory({
            id: message.chat_room_id,
            roles: [role],
        })
        useAuthStore.setState({ userId })
        useChatsStore.setState({ chatRooms: { [room.id]: room } })
        const contextValue = {
            roomId: message.chat_room_id,
            setEditingMessageId,
        }
        return render(
            <chatRoomContext.Provider value={contextValue}>
                <Message message={message} />
            </chatRoomContext.Provider>
        )
    }

    describe('edit button', () => {
        it('should call setEditingMessageId with message id when clicked', async () => {
            const userId = 10
            const message = textMessageFactory({
                id: 123,
                created_by_id: userId,
            })
            const component = renderMessage(message, { userId })
            const editButton = component.getByTestId('edit-message-button')
            await act(async () => {
                fireEvent.click(editButton)
            })
            expect(setEditingMessageId).toHaveBeenCalledWith(123)
        })

        it('should not show edit button for non-creator', () => {
            const message = textMessageFactory({
                id: 123,
                created_by_id: 999,
            })
            const component = renderMessage(message, { userId: 10 })
            expect(component.queryByTestId('edit-message-button')).toBeFalsy()
        })
    })
})
