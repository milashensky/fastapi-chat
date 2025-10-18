import { Outlet, useNavigate } from 'react-router'
import { useAuthStore } from './auth-store'
import { useEffect } from 'react'


const Layout = () => {
    const userId = useAuthStore(({ userId }) => userId)
    const navigate = useNavigate()
    useEffect(() => {
        if (userId === null) {
            const currentPath = window.location.pathname
            navigate(`/login?next=${currentPath}`)
        }
    }, [userId])
    return <Outlet />
}

export default Layout
