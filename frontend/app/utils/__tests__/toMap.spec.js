import { userFactory } from '~/test/factories/user'
import { toMap } from '../toMap'


describe('toMap', () => {
    it('should return list of objects mapped by field', () => {
        const item1 = userFactory({ id: 11 })
        const item2 = userFactory({ id: 22 })
        const item3 = userFactory({ id: 33 })
        const item4 = userFactory({ id: 44 })
        const result = toMap(
            [
                item1,
                item2,
                item3,
                item4,
            ],
            'id'
        )
        expect(result).toStrictEqual({
            [item1.id]: item1,
            [item2.id]: item2,
            [item3.id]: item3,
            [item4.id]: item4,
        })
    })
})
