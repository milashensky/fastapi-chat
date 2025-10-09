import { act, fireEvent } from '@testing-library/react'
import { useAuthStore } from '~/auth/auth-store'
import { BadResponseError } from "~/utils/request"
import { describeComponent } from '~/test/unit/componentTest'
import { manualPromise } from '~/test/unit/manualPromise'
import Registration from '../registration'

vi.mock('zustand')

describeComponent('Registration', ({ render }) => {
    const validData = {
        email: 'somebody.once@told.me',
        name: 'name',
        password: 'somebody_0nce_told_m3',
    }

    it.each([
        {
            email: '',
            name: '',
            password: '',
            password2: '',
        },
        {
            email: 'somebody',
            name: validData.name,
            password: validData.password,
            password2: validData.password2,
        },
        {
            email: validData.email,
            name: validData.name,
            password: 'somebody_0nce_told_m',
            password2: validData.password,
        },
    ])('should not send request if form is invalid', async (context) => {
        const registerUserMock = vi.fn()
        useAuthStore.setState({
            registerUser: registerUserMock,
        })
        const {
            email,
            name,
            password,
            password2,
        } = context
        const component = render(<Registration />)
        const submitBtn = component.getByRole('button')
        await act(async () => {
            fireEvent.input(component.getByLabelText('Name'), { target: { value: name } })
            fireEvent.input(component.getByLabelText('Email'), { target: { value: email } })
            fireEvent.input(component.getByLabelText('Password'), { target: { value: password } })
            fireEvent.input(component.getByLabelText('Repeat password'), { target: { value: password2 } })
            fireEvent.click(submitBtn)
        })
        expect(submitBtn).not.toHaveAttribute('disabled')
        expect(registerUserMock).not.toHaveBeenCalled()
    })

    it('should call send api request on form submit', async () => {
        const registerUserMock = manualPromise()
        useAuthStore.setState({
            registerUser: registerUserMock,
        })
        const component = render(<Registration />)
        const submitBtn = component.getByRole('button')
        await act(async () => {
            fireEvent.input(component.getByLabelText('Name'), { target: { value: validData.name } })
            fireEvent.input(component.getByLabelText('Email'), { target: { value: validData.email } })
            fireEvent.input(component.getByLabelText('Password'), { target: { value: validData.password } })
            fireEvent.input(component.getByLabelText('Repeat password'), { target: { value: validData.password } })
            fireEvent.click(submitBtn)
        })
        expect(submitBtn).toHaveAttribute('disabled')
        await act(async() => await registerUserMock.resolve())
        expect(registerUserMock).toHaveBeenCalledWith(validData)
        expect(submitBtn).not.toHaveAttribute('disabled')
    })

    it('should reset pending state if request fails', async () => {
        const registerUserMock = manualPromise()
        useAuthStore.setState({
            registerUser: registerUserMock,
        })
        const component = render(<Registration />)
        const submitBtn = component.getByRole('button')
        await act(async () => {
            fireEvent.input(component.getByLabelText('Name'), { target: { value: validData.name } })
            fireEvent.input(component.getByLabelText('Email'), { target: { value: validData.email } })
            fireEvent.input(component.getByLabelText('Password'), { target: { value: validData.password } })
            fireEvent.input(component.getByLabelText('Repeat password'), { target: { value: validData.password } })
            fireEvent.click(submitBtn)
        })
        expect(submitBtn).toHaveAttribute('disabled')
        await act(async() => await registerUserMock.reject(new BadResponseError({ data: { name: ['invalid'] } })))
        expect(registerUserMock).toHaveBeenCalledWith(validData)
        expect(submitBtn).not.toHaveAttribute('disabled')
    })
})
