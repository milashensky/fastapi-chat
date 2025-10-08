import { Outlet } from "react-router"
import ChatsSidebar from "./chats-sidebar"
import './layout.scss'
import { useChatsStore } from "./chats-store"

export const clientLoader = async () => {
    try {
        const response = await useChatsStore.getState().list()
        return response
    } catch (e) {
        // user is not authorized, it's normal
        return null
    }
}

export function shouldRevalidate() {
    return false
}


const ChatLayout = () => {
    return (
        <div className="layout">
            <ChatsSidebar />
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default ChatLayout
