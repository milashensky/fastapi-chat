import { faker } from '@faker-js/faker'

export const chatRoomFactory = (overrides = {}) => ({
    id: faker.number.int(),
    name: faker.person.fullName(),
    roles: [],
    ...overrides,
})
