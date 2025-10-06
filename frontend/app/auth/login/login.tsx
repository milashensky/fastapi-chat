import { NavLink } from "react-router"
import ErrorList from '~/ui-kit/error-list'
import Button from "~/ui-kit/button"
import Form, { type FormRef } from "~/ui-kit/form"
import Input from "~/ui-kit/input"
import { useStateRef } from "~/utils/stateRef"
import { useLoginState } from "./use-login-state"
import {
    emailValidator,
    getMinLengthValidator,
    requiredFieldValidator,
} from "~/utils/validators"
import { useRef } from "react"

const passwordLengthValidator = getMinLengthValidator(6)

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
        <div>
            <h2>
                Login
            </h2>
            <Form
                onSubmit={submit}
                ref={formRef}
            >
                <ErrorList
                    errors={errors.current.__all__}
                />
                <div>
                    <Input
                        data-testid="email"
                        label="Email"
                        placeholder="Enter email"
                        disabled={isPending.current}
                        type="email"
                        value={email.current}
                        rules={[requiredFieldValidator, emailValidator]}
                        errors={errors.current.email}
                        onInput={(value) => email.current = value}
                    />
                </div>
                <div>
                    <Input
                        data-testid="password"
                        label="Password"
                        placeholder="Enter password"
                        disabled={isPending.current}
                        type="password"
                        value={password.current}
                        rules={[requiredFieldValidator, passwordLengthValidator]}
                        errors={errors.current.password}
                        onInput={(value) => password.current = value}
                    />
                </div>
                <Button
                    type="submit"
                    disabled={isPending.current}
                >
                    Login
                </Button>
            </Form>
            <NavLink to="/registration">
                Registration
            </NavLink>
        </div>
    )
}
