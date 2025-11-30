import flushPromises from 'flush-promises'
import { act, fireEvent } from '@testing-library/react'
import { describeComponent } from '~/test/unit/componentTest'
import { textMessageFactory } from '~/test/factories/chatMessage'
import { useMessagesStore } from '~/chat/messages-store'
import DeleteMessageButton from '../delete-message-button'


describeComponent('DeleteMessageButton', ({ render }) => {
    const message = textMessageFactory()

    it('should show delete button', () => {
        const component = render(
            <DeleteMessageButton message={message} />
        )
        const deleteButton = component.getByTestId('delete-message-button')
        expect(deleteButton).toBeTruthy()
    })

    it('should show confirmation dialog on delete button click', async () => {
        const component = render(
            <DeleteMessageButton message={message} />
        )
        const deleteButton = component.getByTestId('delete-message-button')
        await act(async () => {
            fireEvent.click(deleteButton)
        })
        const confirmButton = component.getByTestId('confirm-button')
        expect(confirmButton).toBeTruthy()
    })

    it('should trigger delete action on confirm click', async () => {
        const deleteMessage = vi.fn()
        useMessagesStore.setState({ deleteMessage })
        const component = render(
            <DeleteMessageButton message={message} />
        )
        const deleteButton = component.getByTestId('delete-message-button')
        await act(async () => {
            fireEvent.click(deleteButton)
        })
        const confirmButton = component.getByTestId('confirm-button')
        await act(async () => {
            fireEvent.click(confirmButton)
            await flushPromises()
        })
        expect(deleteMessage).toHaveBeenCalledWith(message.id)
    })

    it('should not trigger delete on dismiss click', async () => {
        const deleteMessage = vi.fn()
        useMessagesStore.setState({ deleteMessage })
        const component = render(
            <DeleteMessageButton message={message} />
        )
        const deleteButton = component.getByTestId('delete-message-button')
        await act(async () => {
            fireEvent.click(deleteButton)
        })
        const dismissButton = component.getByTestId('dismiss-button')
        await act(async () => {
            fireEvent.click(dismissButton)
            await flushPromises()
        })
        expect(deleteMessage).not.toHaveBeenCalled()
    })
})
