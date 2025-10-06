import {
    requiredFieldValidator,
    getMinLengthValidator,
    emailValidator,
} from '../validators'

describe('validators', () => {
    describe('requiredFieldValidator', () => {
        it.each([
            {
                value: '',
                expected: 'This field is required.',
            },
            {
                value: 'asd',
                expected: true,
            },
            {
                value: 0,
                expected: true,
            },
            {
                value: null,
                expected: 'This field is required.',
            },
            {
                value: undefined,
                expected: 'This field is required.',
            },
        ])('should return $expected for value $value', (context) => {
            const {
                expected,
                value
            } = context
            const result = requiredFieldValidator(value)
            expect(result).toStrictEqual(expected)
        })
    })

    describe('getMinLengthValidator', () => {
        it.each([
            {
                length: 3,
                value: 'asd',
                expected: true,
            },
            {
                length: 3,
                value: 'as',
                expected: 'Must be at least 3 characters long.',
            },
            {
                length: 10,
                value: 'somebody',
                expected: 'Must be at least 10 characters long.',
            },
        ])('should return $expected for value $value', (context) => {
            const {
                expected,
                length,
                value
            } = context
            const result = getMinLengthValidator(length)(value)
            expect(result).toStrictEqual(expected)
        })
    })

    describe('emailValidator', () => {
        it.each([
            {
                value: 'somebody',
                expected: 'Invalid email address.',
            },
            {
                value: 'somebody@once',
                expected: 'Invalid email address.',
            },
            {
                value: 'somebody@once@told.me',
                expected: 'Invalid email address.',
            },
            {
                value: 'somebody-12.23.-123@told.me',
                expected: true,
            },
            {
                value: 'somebody@once.told',
                expected: true,
            },
        ])('should return $expected for value $value', (context) => {
            const {
                expected,
                value
            } = context
            const result = emailValidator(value)
            expect(result).toStrictEqual(expected)
        })
    })
})
