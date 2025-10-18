import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { getMessages, useMessagesStore } from '~/chat/messages-store'
import { toValue, type MaybeRef } from '~/utils/stateRef'
import { MessageTypeEnum } from '../types'


interface Options {
    roomId: MaybeRef<number>
    search?: MaybeRef<string>
}

const INITIAL_PAGE = 1

export const useRoomMessages = (options: Options) => {
    const [page, setPage] = useState(INITIAL_PAGE)
    const [isLoading, setLoading] = useState(false)
    const [canFetchNext, setCanFetchNext] = useState(true)
    useEffect(() => {
        setPage(INITIAL_PAGE)
        setCanFetchNext(true)
    }, [toValue(options.roomId), toValue(options.search)])

    const cleanedSearch = toValue(options.search)?.trim()

    const getFilters = () => {
        if (!cleanedSearch) {
            return {
                page,
            }
        }
        return {
            page,
            search: cleanedSearch,
        }
    }
    const fetchNext = async () => {
        if (isLoading) {
            return
        }
        setLoading(true)
        try {
            const pageData = await useMessagesStore.getState().list({
                roomId: toValue(options.roomId),
                filters: getFilters(),
            })
            setCanFetchNext(pageData.next !== null)
            setPage(pageData.page + 1)
        }
        finally {
            setLoading(false)
        }
    }
    const allMessages = useMessagesStore(useShallow(getMessages))
    const filteredMessages = allMessages.filter((message) => {
        if (message.chat_room_id !== options.roomId) {
            return false
        }
        if (cleanedSearch) {
            if (message.type !== MessageTypeEnum.TEXT) {
                return false
            }
            return message.content.toLowerCase().match(cleanedSearch.toLowerCase())
        }
        return true
    })
    const sortedMessages = filteredMessages.sort((message1, message2) => message1.created_at.localeCompare(message2.created_at))
    return {
        fetchNext,
        canFetchNext,
        isLoading,
        messages: sortedMessages,
    }
}
