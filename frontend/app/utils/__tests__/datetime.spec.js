import {
    toLocalIsoDate,
    formatDateRelative,
    formatTime,
} from '../datetime'


describe('datetime', () => {
    beforeEach(() => {
        vi.stubEnv('TZ', 'UTC')
        vi.useFakeTimers().setSystemTime(new Date('2025-12-13T12:00:00'))
    })

    describe('toLocalIsoDate', () => {
        it.each([
            {
                value: '2025-12-12T12:12:00',
                expected: '2025-12-12',
            },
            {
                value: new Date('2025-12-12T12:12:00'),
                expected: '2025-12-12',
            },
        ])('should return $expected for $value', (context) => {
            const {
                value,
                expected,
            } = context
            const result = toLocalIsoDate(value)
            expect(result).toStrictEqual(expected)
        })

        it('should return date in local timezone', () => {
            // Posix TZ tz is reverse
            vi.stubEnv('TZ', 'UTC-3')
            const result = toLocalIsoDate('2025-12-12T23:00:00.0000Z')
            expect(result).toStrictEqual('2025-12-13')
        })
    })

    describe('formatTime', () => {
        it.each([
            {
                value: '2025-12-12T12:12:00',
                expected: '12:12',
            },
            {
                value: new Date('2025-12-12T12:30:00Z'),
                expected: '12:30',
            },
            {
                value: new Date('2025-12-12T12:30:00+03:00'),
                expected: '09:30',
            },
        ])('should return $expected for $value', (context) => {
            const {
                value,
                expected,
            } = context
            const result = formatTime(value)
            expect(result).toStrictEqual(expected)
        })

        it('should return date in local timezone', () => {
            // Posix TZ tz is reverse
            vi.stubEnv('TZ', 'UTC-3')
            const result = formatTime('2025-12-12T23:00:00.0000Z')
            expect(result).toStrictEqual('02:00')
        })
    })

    describe('formatDateRelative', () => {
        it.each([
            {
                value: '2025-12-12T12:12:00',
                expected: '12 December',
            },
            {
                value: new Date('2025-12-03T12:30:00Z'),
                expected: '3 December',
            },
            {
                value: new Date('2024-11-12T12:30:00Z'),
                expected: '12 November 2024',
            },
        ])('should return $expected for $value', (context) => {
            const {
                value,
                expected,
            } = context
            const result = formatDateRelative(value)
            expect(result).toStrictEqual(expected)
        })

        it('should return date in local timezone', () => {
            // Posix TZ tz is reverse
            vi.stubEnv('TZ', 'UTC-3')
            const result = formatDateRelative('2025-12-12T23:00:00.0000Z')
            expect(result).toStrictEqual('13 December')
        })
    })
})
