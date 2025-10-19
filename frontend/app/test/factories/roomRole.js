import { faker } from '@faker-js/faker'
import { RoomRoleEnum } from '~/chat/types'


export const roomRoleFactory = (overrides = {}) => ({
    id: faker.number.int(),
    user_id: faker.number.int(),
    chat_room_id: faker.number.int(),
    role: faker.helpers.enumValue(RoomRoleEnum),
    ...overrides,
})
