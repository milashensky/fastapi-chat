import { Outlet, useNavigate, useSearchParams } from "react-router";
import { useAuthStore } from "./auth-store";
import { useEffect } from "react";
import { DEFAULT_PAGE } from "~/utils/constants";

const Layout = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const userId = useAuthStore(({ userId }) => userId)
    useEffect(() => {
        const next = searchParams.get('next')
        if (userId !== null) {
            const nextRoute = next || DEFAULT_PAGE
            navigate(nextRoute, { replace: true })
        }
    }, [userId])
    return <Outlet />
}

export default Layout
