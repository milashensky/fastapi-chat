import { NavLink } from "react-router"
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
                <div>
                    <Input
                        label="Email"
                        placeholder="Enter email"
                        type="email"
                        value={email.current}
                        onInput={(value) => email.current = value}
                    />
                </div>
                <div>
                    <Input
                        label="Password"
                        placeholder="Enter password"
                        type="password"
                        value={password.current}
                        onInput={(value) => password.current = value}
                    />
                </div>
                <Button type="submit">
                    Login
                </Button>
            </Form>
            <NavLink to="/registration">
                Registration
            </NavLink>
        </div>
    )
}
