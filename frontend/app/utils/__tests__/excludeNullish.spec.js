import { excludeNullish } from '../excludeNullish'


describe('excludeNullish', () => {
    it.each([
        {
            input: 0,
            expected: true,
        },
        {
            input: '',
            expected: true,
        },
        {
            input: [],
            expected: true,
        },
        {
            input: {},
            expected: true,
        },
        {
            input: null,
            expected: false,
        },
        {
            input: undefined,
            expected: false,
        },
    ])('should return $expected for value $input', (context) => {
        const {
            expected,
            input,
        } = context
        const result = excludeNullish(input)
        expect(result).toStrictEqual(expected)
    })
})
