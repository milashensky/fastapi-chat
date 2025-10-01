import { Outlet } from "react-router";

const Layout = () => {
    return (
        <div>
            layout unauth
            <Outlet />
        </div>
    );
}

export default Layout
