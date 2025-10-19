import flushPromises from 'flush-promises'
import { act, fireEvent } from '@testing-library/react'
import { useAuthStore } from '~/auth/auth-store'
import { chatRoomContext } from '~/chat/chat-room/chat-room-context'
import { useChatsStore } from '~/chat/chats-store'
import { ROOT_ROUTE } from '~/utils/constants'
import { describeComponent } from '~/test/unit/componentTest'
import { roomRoleFactory } from '~/test/factories/roomRole'
import { chatRoomFactory } from '~/test/factories/chatRoom'
import LeaveChatButton from '../leave-chat-button'


describeComponent('LeaveChatButton', ({ render, reactRouter }) => {
    const role = roomRoleFactory()
    const chatRoom = chatRoomFactory({
        roles: [
            role,
            roomRoleFactory(),
        ],
    })
    const context = {
        roomId: chatRoom.id,
    }

    it('should trigger role delete, delete chat and navigate to root on confirm click', async () => {
        const deleteRoomRole = vi.fn()
        const unstoreChat = vi.fn()
        const otherRoom = chatRoomFactory()
        useChatsStore.setState({
            deleteRoomRole,
            unstoreChat,
            chatRooms: {
                [chatRoom.id]: chatRoom,
                [otherRoom.id]: otherRoom,
            },
        })
        useAuthStore.setState({ userId: role.user_id })
        const navigateMock = vi.fn()
        vi.spyOn(reactRouter, 'useNavigate').mockReturnValue(navigateMock)
        const component = render(
            <chatRoomContext.Provider
                value={context}
            >
                <LeaveChatButton />
            </chatRoomContext.Provider>
        )
        const confirmButton = component.getByTestId('confirm-button')
        expect(confirmButton).toBeTruthy()
        await act(async () => {
            fireEvent.click(confirmButton)
            await flushPromises()
        })
        expect(deleteRoomRole).toHaveBeenCalledWith(role.id)
        expect(unstoreChat).toHaveBeenCalledWith(chatRoom.id)
        expect(navigateMock).toHaveBeenCalledWith(ROOT_ROUTE)
    })
})
