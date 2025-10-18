import { useRef, useState } from 'react'
import { NavLink } from 'react-router'
import Button from '~/ui-kit/button'
import Card from '~/ui-kit/card'
import ErrorList from '~/ui-kit/error-list'
import Form, { type FormRef } from '~/ui-kit/form'
import Input from '~/ui-kit/input'
import {
    emailValidator,
    passwordLengthValidator,
    requiredFieldValidator,
} from '~/utils/validators'
import type { RegistrationForm } from '~/auth/types'
import { useAuthStore } from '~/auth/auth-store'
import type { FormErrors } from '~/globals/types'
import { BadResponseError } from '~/utils/request'


type ResponseErrors = FormErrors<RegistrationForm>

export default () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [isPending, setPending] = useState(false)
    const [errors, setErrors] = useState<ResponseErrors>({})
    const formRef = useRef<FormRef>(null)
    const passwordMatchValidator = (value?: string) => {
        if (!value) {
            return true
        }
        if (value !== password) {
            return "Passwords don't match."
        }
        return true
    }
    const validate = (): boolean => {
        const isValid = formRef.current?.validate()
        return Boolean(isValid)
    }
    const registerUser = useAuthStore((state) => state.registerUser)
    const submit = async () => {
        const isValid = validate()
        if (!isValid) {
            return
        }
        setPending(true)
        try {
            await registerUser({
                name,
                email,
                password,
            })
        }
        catch (e) {
            if (e instanceof BadResponseError) {
                setErrors(e.errors as ResponseErrors)
            }
        }
        finally {
            setPending(false)
        }
    }
    return (
        <Card
            maxWidth={360}
            className="flex flex-col items-center m-2 w-full"
        >
            <h2>
                Registration
            </h2>
            <Form
                onSubmit={submit}
                ref={formRef}
                className="flex flex-col gap-4"
            >
                <ErrorList
                    errors={errors.__all__}
                />
                <Input
                    name="name"
                    label="Name"
                    placeholder="Enter your name"
                    disabled={isPending}
                    type="text"
                    value={name}
                    rules={[requiredFieldValidator]}
                    errors={errors.name}
                    onInput={setName}
                />
                <Input
                    name="email"
                    label="Email"
                    placeholder="Enter email"
                    disabled={isPending}
                    type="email"
                    value={email}
                    rules={[requiredFieldValidator, emailValidator]}
                    errors={errors.email}
                    onInput={setEmail}
                />
                <Input
                    name="password"
                    label="Password"
                    placeholder="Enter password"
                    disabled={isPending}
                    type="password"
                    value={password}
                    rules={[requiredFieldValidator, passwordLengthValidator]}
                    errors={errors.password}
                    onInput={setPassword}
                />
                <Input
                    name="password2"
                    label="Repeat password"
                    placeholder="Repeat password"
                    disabled={isPending}
                    type="password"
                    value={password2}
                    rules={[requiredFieldValidator, passwordLengthValidator, passwordMatchValidator]}
                    onInput={setPassword2}
                />
                <Button
                    type="submit"
                    disabled={isPending}
                >
                    Create account
                </Button>
            </Form>
            <NavLink
                to="/login"
                className="p-1 mt-1"
            >
                Login
            </NavLink>
        </Card>
    )
}
