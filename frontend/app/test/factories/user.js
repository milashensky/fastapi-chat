import { faker } from '@faker-js/faker'


export const userFactory = (overrides = {}) => ({
    id: faker.number.int(),
    name: faker.person.fullName(),
    ...overrides,
})
