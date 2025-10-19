import { act, fireEvent } from '@testing-library/react'
import { describeComponent } from '~/test/unit/componentTest'
import { chatRoomFactory } from '~/test/factories/chatRoom'
import EditChatNameForm from '../edit-chat-name-form'
import * as controller from '../use-chat-edit'


vi.mock('../use-chat-edit')

describeComponent('EditChatNameForm', ({ render }) => {
    const chat = chatRoomFactory()

    it('should call submit on form submit', () => {
        const onBack = vi.fn()
        const component = render(
            <EditChatNameForm
                chat={chat}
                onBack={onBack}
            />
        )
        const submitBtn = component.getByTestId('submit')
        expect(submitBtn).not.toHaveAttribute('disabled')
        act(() => {
            fireEvent.click(submitBtn)
        })
        expect(controller.submit).toHaveBeenCalled()
    })

    it('should call onBack on cancel button click', () => {
        const onBack = vi.fn()
        const component = render(
            <EditChatNameForm
                chat={chat}
                onBack={onBack}
            />
        )
        const cancelBtn = component.getByTestId('reset')
        expect(cancelBtn).not.toHaveAttribute('disabled')
        act(() => {
            fireEvent.click(cancelBtn)
        })
        expect(onBack).toHaveBeenCalled()
    })

    it('should disable fields if form is pending', () => {
        controller.isPending.current = true
        const onBack = vi.fn()
        const component = render(
            <EditChatNameForm
                chat={chat}
                onBack={onBack}
            />
        )
        const submitBtn = component.getByTestId('submit')
        expect(submitBtn).toHaveAttribute('disabled')
        const cancelBtn = component.getByTestId('reset')
        expect(cancelBtn).toHaveAttribute('disabled')
        const nameInput = component.getByTestId('name-input')
        expect(nameInput).toHaveAttribute('disabled')
    })
})
