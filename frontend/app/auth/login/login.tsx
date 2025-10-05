import { NavLink } from "react-router"
import ErrorList from '~/ui-kit/error-list'
import Button from "~/ui-kit/button"
import Form from "~/ui-kit/form"
import Input from "~/ui-kit/input"
import { useStateRef } from "~/utils/stateRef"
import { useLoginState } from "./use-login-state"

export default () => {
    const email = useStateRef('')
    const password = useStateRef('')
    const {
        submit,
        isPending,
        errors,
    } = useLoginState({
        email,
        password,
    })
    return (
        <div>
            <h2>
                Login
            </h2>
            <Form
                onSubmit={submit}
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
