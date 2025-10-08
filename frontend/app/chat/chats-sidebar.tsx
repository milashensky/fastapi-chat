import { NavLink } from "react-router"
import { useShallow } from "zustand/shallow"
import { useAuthStore } from "~/auth/auth-store"
import { useStateRef } from "~/utils/stateRef"
import CreateChatDialog from "./create-chat/create-chat-dialog"
import { useChatsStore, getChats } from "./chats-store"
import type { ChatRoom } from "./types"
import { CHAT_BASE_ROUTE } from "~/utils/constants"

const ChatsSidebar = () => {
    const logout = useAuthStore((state) => state.logout)
    const isCreateDialogShown = useStateRef(false)
    const chats: ChatRoom[] = useChatsStore(useShallow(getChats))
    const showCreateDialog = () => {
        isCreateDialogShown.current = true
    }
    const hideDialog = () => {
        isCreateDialogShown.current = false
    }
    return (
        <nav>
            <ul>
                {chats.map((chat) => (
                    <li
                        key={chat.id}
                    >
                        <NavLink
                            to={`${CHAT_BASE_ROUTE}/${chat.id}`}
                        >
                            {chat.name}
                        </NavLink>
                    </li>
                ))}
            </ul>
            <ul>
                <li>
                    <a onClick={showCreateDialog}>
                        Create chat
                    </a>
                </li>
                <li>
                    <a onClick={logout}>
                        Logout
                    </a>
                </li>
            </ul>
            <CreateChatDialog
                isShown={isCreateDialogShown.current}
                onHide={hideDialog}
            />
        </nav>
    )
}

export default ChatsSidebar
