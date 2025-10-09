import {
    format,
} from 'date-fns'

export type RawDate = string | Date | number

export const toLocalIsoDate = (rawDate: RawDate): string => {
    const cleanedDate = new Date(rawDate)
    return format(cleanedDate, 'yyyy-MM-dd')
}


export const formatTime = (rawDate: RawDate): string => {
    const cleanedDate = new Date(rawDate)
    return format(cleanedDate, 'HH:mm')
}

export const formatDateRelative = (rawDate: RawDate): string => {
    const currentYear = new Date().getFullYear()
    const cleanedDate = new Date(rawDate)
    if (cleanedDate.getFullYear() !== currentYear) {
        return format(cleanedDate, 'd MMMM yyyy')
    }
    return format(cleanedDate, 'd MMMM')
}
