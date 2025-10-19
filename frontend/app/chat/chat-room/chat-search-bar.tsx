import { useContext, useEffect, useState } from 'react'

import {
    chatRoomContext,
    ChatRoomStateEnum,
} from '~/chat/chat-room/chat-room-context'
import Button from '~/ui-kit/button'
import Icon from '~/ui-kit/icon'
import Input from '~/ui-kit/input'
import { useKeyboardShortcut } from '~/utils/useKeyboardShortcut'
import { useDebounced } from '~/utils/useDebounced'

import './styles/chat-details-bar.scss'


const ChatSearchBar = () => {
    const [searchInternal, setSearchInternal] = useState('')
    const {
        setSearch,
        setState,
    } = useContext(chatRoomContext)
    const setSearchDebounced = useDebounced({
        callback: () => {
            setSearch(searchInternal)
        }
    })
    useEffect(setSearchDebounced, [searchInternal])
    const closeSearch = () => {
        setSearch('')
        setSearchInternal('')
        setState(ChatRoomStateEnum.MESSAGE)
    }
    useKeyboardShortcut({
        shortcut: 'esc',
        callback: closeSearch,
    })
    return (
        <div className="chat-room-top-bar">
            <div className="flex-1">
                <Input
                    value={searchInternal}
                    type="search"
                    autoFocus
                    placeholder="Search..."
                    onInput={setSearchInternal}
                />
            </div>
            <Button
                icon
                color="secondary"
                onClick={closeSearch}
            >
                <Icon icon="close" />
            </Button>
        </div>
    )
}

export default ChatSearchBar
