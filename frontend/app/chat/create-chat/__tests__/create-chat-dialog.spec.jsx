import { act, fireEvent } from '@testing-library/react'
import { describeComponent } from '~/test/unit/componentTest'
import CreateChatDialog from '../create-chat-dialog'
import * as controller from '../use-create-chat'

vi.mock('../use-create-chat')

describeComponent('create-chat-dialog', ({ render }) => {
    it('should init controller', () => {
        render(<CreateChatDialog />)
        expect(controller.useCreateChat).toHaveBeenCalledWith({
            name: expect.anything(),
            actions: {
                validate: expect.anything(),
                onSuccess: expect.anything(),
            },
        })
    })

    it('should call submit on form submit', () => {
        const component = render(<CreateChatDialog />)
        const submitBtn = component.getByTestId('submit')
        expect(submitBtn).not.toHaveAttribute('disabled')
        act(() => {
            fireEvent.click(submitBtn)
        })
        expect(controller.submit).toHaveBeenCalled()
    })

    it('should disable fields if form is pending', () => {
        controller.isPending.current = true
        const component = render(<CreateChatDialog />)
        const submitBtn = component.getByTestId('submit')
        expect(submitBtn).toHaveAttribute('disabled')
        const emailInput = component.getByTestId('name')
        expect(emailInput).toHaveAttribute('disabled')
    })
})
