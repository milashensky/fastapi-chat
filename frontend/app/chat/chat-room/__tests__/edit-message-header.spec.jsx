import { act, fireEvent } from '@testing-library/react'
import { describeComponent } from '~/test/unit/componentTest'
import { chatRoomContext } from '../chat-room-context'
import EditMessageHeader from '../edit-message-header'


describeComponent('EditMessageHeader', ({ render }) => {
    const setEditingMessageId = vi.fn()

    const renderWithContext = () => {
        const contextValue = {
            roomId: 1,
            editingMessage: { id: 1, content: 'test' },
            setEditingMessageId,
        }
        return render(
            <chatRoomContext.Provider value={contextValue}>
                <EditMessageHeader />
            </chatRoomContext.Provider>
        )
    }

    it('should render edit label', () => {
        const component = renderWithContext()
        expect(component.getByText('Edit message')).toBeTruthy()
    })

    it('should call setEditingMessageId with null on close button click', async () => {
        const component = renderWithContext()
        const closeButton = component.getByTestId('cancel-edit-button')
        await act(async () => {
            fireEvent.click(closeButton)
        })
        expect(setEditingMessageId).toHaveBeenCalledWith(null)
    })
})
