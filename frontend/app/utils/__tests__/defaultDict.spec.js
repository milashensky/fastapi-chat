import { defaultDict } from '../defaultDict'


describe('defaultDict', () => {
    it('should automatically create fist value for key', () => {
        const value = defaultDict(() => [])
        value['1'].push(2)
        value['1'].push(3)
        expect(Object.values(value)).toStrictEqual([[2, 3]])
        expect(Object.entries(value)).toStrictEqual([['1', [2, 3]]])
    })

    it('should support set', () => {
        const value = defaultDict(() => [])
        value[1] = ['value1', 'value2']
        expect(Object.values(value)).toStrictEqual([['value1', 'value2']])
    })
})
