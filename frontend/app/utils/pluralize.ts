interface PluralizationOptions {
    suffix?: string
    pluralForm?: string
}

export const pluralize = (word: string, count: number, options: PluralizationOptions = {}): string => {
    const {
        suffix = 's',
        pluralForm,
    } = options
    if (Math.abs(count) === 1) {
        return word
    }
    return pluralForm ?? `${word}${suffix}`
}
