import { pluralize } from '../pluralize'

describe('pluralize', () => {
    it.each([
        {
            word: 'egg',
            count: 1,
            expected: 'egg',
        },
        {
            word: 'egg',
            count: -1,
            expected: 'egg',
        },
        {
            word: 'egg',
            count: 2,
            expected: 'eggs',
        },
        {
            word: 'egg',
            count: 0,
            expected: 'eggs',
        },
        {
            word: 'egg',
            count: 10,
            expected: 'eggs',
        },
    ])('should return $expected for $count of $word', (context) => {
        const {
            word,
            count,
            expected,
        } = context
        const result = pluralize(word, count)
        expect(result).toStrictEqual(expected)
    })

    it('should support custom plural form', () => {
        const result = pluralize('goose', 10, {
            pluralForm: 'geese'
        })
        expect(result).toStrictEqual('geese')
    })
})
