import { faker } from '@faker-js/faker'

export const chatRoomInviteFactory = (overrides = {}) => ({
    id: faker.string.uuid(),
    ...overrides,
})