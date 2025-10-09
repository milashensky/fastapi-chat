import { faker } from '@faker-js/faker'
import { MessageTypeEnum } from '~/chat/types'

export const chatMessageFactory = (overrides = {}) => ({
    'id': faker.number.int(),
    'content': faker.lorem.paragraph(),
    'type': faker.helpers.enumValue(MessageTypeEnum),
    'chat_room_id': faker.number.int(),
    'created_by_id': faker.number.int(),
    'created_at': faker.date.past().toISOString(),
    ...overrides,
})


export const textMessageFactory = (overrides = {}) => chatMessageFactory({
    'type': MessageTypeEnum.TEXT,
    ...overrides,
})

export const systemMessageFactory = (overrides = {}) => chatMessageFactory({
    'type': MessageTypeEnum.SYSTEM_ANNOUNCEMENT,
    ...overrides,
})
