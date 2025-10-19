import flushPromises from 'flush-promises'
import { act, fireEvent } from '@testing-library/react'
import { chatRoomContext } from '~/chat/chat-room/chat-room-context'
import { useChatsStore } from '~/chat/chats-store'
import { ROOT_ROUTE } from '~/utils/constants'
import { describeComponent } from '~/test/unit/componentTest'
import { chatRoomFactory } from '~/test/factories/chatRoom'
import DeleteChatButton from '../delete-chat-button'


describeComponent('DeleteChatButton', ({ render, reactRouter }) => {
    const chatRoom = chatRoomFactory({})
    const context = {
        roomId: chatRoom.id,
    }

    it('should trigger chat delete and navigate to root on confirm click', async () => {
        const deleteChat = vi.fn()
        const otherRoom = chatRoomFactory()
        useChatsStore.setState({
            deleteChat,
            chatRooms: {
                [chatRoom.id]: chatRoom,
                [otherRoom.id]: otherRoom,
            },
        })
        const navigateMock = vi.fn()
        vi.spyOn(reactRouter, 'useNavigate').mockReturnValue(navigateMock)
        const component = render(
            <chatRoomContext.Provider
                value={context}
            >
                <DeleteChatButton />
            </chatRoomContext.Provider>
        )
        const confirmButton = component.getByTestId('confirm-button')
        expect(confirmButton).toBeTruthy()
        await act(async () => {
            fireEvent.click(confirmButton)
            await flushPromises()
        })
        expect(deleteChat).toHaveBeenCalledWith(chatRoom.id)
        expect(navigateMock).toHaveBeenCalledWith(ROOT_ROUTE)
    })
})
