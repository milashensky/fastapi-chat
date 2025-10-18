import { NavLink } from 'react-router'
import { useShallow } from 'zustand/shallow'
import { useAuthStore } from '~/auth/auth-store'
import { useStateRef } from '~/utils/stateRef'
import { CHAT_BASE_ROUTE } from '~/utils/constants'
import CreateChatDialog from './create-chat/create-chat-dialog'
import { useChatsStore, getChats } from './chats-store'
import type { ChatRoom } from './types'
import './styles/chats-sidebar.scss'


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
                            className="nav-item"
                            to={`${CHAT_BASE_ROUTE}/${chat.id}`}
                        >
                            {chat.name}
                        </NavLink>
                    </li>
                ))}
            </ul>
            <div className="flex flex-1" />
            <ul className="shrink-0">
                <li>
                    <a
                        className="nav-item"
                        onClick={showCreateDialog}
                    >
                        Create chat
                    </a>
                </li>
                <li>
                    <a
                        className="nav-item"
                        onClick={logout}
                    >
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
