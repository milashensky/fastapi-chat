import { act, fireEvent } from '@testing-library/react'
import { describeComponent } from '~/test/unit/componentTest'
import Login from '../login'
import * as controller from '../use-login-state'

vi.mock('../use-login-state')

describeComponent('login', ({ render }) => {
    it('should call submit on form submit', () => {
        const component = render(<Login />)
        const submitBtn = component.getByRole('button')
        expect(submitBtn).not.toHaveAttribute('disabled')
        act(() => {
            fireEvent.click(submitBtn)
        })
        expect(controller.submit).toHaveBeenCalled()
    })

    it('should disable fields if form is pending', () => {
        controller.isPending.current = true
        const component = render(<Login />)
        const submitBtn = component.getByRole('button')
        expect(submitBtn).toHaveAttribute('disabled')
        const emailInput = component.getByLabelText('Email')
        expect(emailInput).toHaveAttribute('disabled')
        const passwordInput = component.getByLabelText('Password')
        expect(passwordInput).toHaveAttribute('disabled')
    })
})
