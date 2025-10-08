import { faker } from '@faker-js/faker'

export const accessTokenFactory = (overrides = {}) => ({
    token: faker.internet.jwt(),
    token_type: 'Bearer',
    expires_at: faker.date.future().getTime() / 1000,
    ...overrides,
})
