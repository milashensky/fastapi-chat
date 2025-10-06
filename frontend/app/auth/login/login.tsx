import { useRef } from "react"
import { NavLink } from "react-router"
import ErrorList from '~/ui-kit/error-list'
import Button from "~/ui-kit/button"
import Form, { type FormRef } from "~/ui-kit/form"
import Input from "~/ui-kit/input"
import Card from "~/ui-kit/card"
import { useStateRef } from "~/utils/stateRef"
import {
    emailValidator,
    passwordLengthValidator,
    requiredFieldValidator,
} from "~/utils/validators"
import { useLoginState } from "./use-login-state"

export default () => {
    const email = useStateRef('')
    const password = useStateRef('')
    const formRef = useRef<FormRef>(null)
    const validate = (): boolean => {
        const isValid = formRef.current?.validate()
        return Boolean(isValid)
    }
    const {
        submit,
        isPending,
        errors,
    } = useLoginState({
        email,
        password,
        actions: {
            validate,
        },
    })
    return (
        <Card
            maxWidth={360}
            className="flex flex-col items-center m-2 w-full"
        >
            <h2>
                Login
            </h2>
            <Form
                onSubmit={submit}
                ref={formRef}
                className="flex flex-col gap-4"
            >
                <ErrorList
                    errors={errors.current.__all__}
                />
                <Input
                    name="email"
                    label="Email"
                    placeholder="Enter email"
                    disabled={isPending.current}
                    type="email"
                    value={email.current}
                    rules={[requiredFieldValidator, emailValidator]}
                    errors={errors.current.email}
                    onInput={(value) => email.current = value}
                />
                <Input
                    name="password"
                    label="Password"
                    placeholder="Enter password"
                    disabled={isPending.current}
                    type="password"
                    value={password.current}
                    rules={[requiredFieldValidator, passwordLengthValidator]}
                    errors={errors.current.password}
                    onInput={(value) => password.current = value}
                />
                <Button
                    type="submit"
                    disabled={isPending.current}
                >
                    Login
                </Button>
            </Form>
            <NavLink
                to="/registration"
                className="p-1 mt-1"
            >
                Registration
            </NavLink>
        </Card>
    )
}
