import { NavLink } from "react-router";
import Button from "~/ui-kit/button";
import Input from "~/ui-kit/input";
import { useStateRef } from "~/utils/stateRef";

export default () => {
    const email = useStateRef('')
    const password = useStateRef('')
    return (
        <div>
            <h2>
                Login
            </h2>
            <form>
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
                <Button>
                    Login
                </Button>
            </form>
            <NavLink to="/registration">
                Registration
            </NavLink>
        </div>
    )
}
