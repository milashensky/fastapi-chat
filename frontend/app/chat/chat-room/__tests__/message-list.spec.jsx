import {
    systemMessageFactory,
    textMessageFactory,
} from '~/test/factories/chatMessage'
import { describeComponent } from '~/test/unit/componentTest'

import MessageList from '../message-list'
import * as controller from '../use-room-messages'


vi.mock('../use-room-messages')

describeComponent('MessageList', ({ render }) => {
    it('should render messages in order, grouped by date and author', () => {
        const userId1 = 1
        const userId2 = 2
        const date1 = '2025-12-12'
        const date2 = '2025-12-13'
        const message1Date1User1 = textMessageFactory({
            created_by_id: userId1,
            created_at: date1,
        })
        const message2Date1User1 = textMessageFactory({
            created_by_id: userId1,
            created_at: date1,
        })
        const message1Date1User2 = textMessageFactory({
            created_by_id: userId2,
            created_at: date1,
        })
        const message2Date1User2 = textMessageFactory({
            created_by_id: userId2,
            created_at: date1,
        })
        const message1Date2User1 = textMessageFactory({
            created_by_id: userId1,
            created_at: date2,
        })
        const message2Date2User1 = textMessageFactory({
            created_by_id: userId1,
            created_at: date2,
        })
        const message1Date2User2 = textMessageFactory({
            created_by_id: userId2,
            created_at: date2,
        })
        const message2Date2User2 = textMessageFactory({
            created_by_id: userId2,
            created_at: date2,
        })
        controller.messages.current = [
            message1Date1User1,
            message2Date1User1,
            message1Date1User2,
            message2Date1User2,
            message1Date2User1,
            message2Date2User1,
            message1Date2User2,
            message2Date2User2,
        ]
        const component = render(<MessageList />)
        const container = component.getByTestId('container')
        const children = container.children
        // 8 messages + 2 dates + 2 user changes per date + intersection observer
        expect(children.length).toBe(15)
        expect(children[0].getAttribute('data-stub')).toBe('intersection')
        expect(children[1].getAttribute('data-testid')).toBe(`date-${date1}`)
        expect(children[2].getAttribute('data-testid')).toBe(`sender-${userId1}`)
        expect(children[3].getAttribute('data-testid')).toBe(`message-${message1Date1User1.id}`)
        expect(children[4].getAttribute('data-testid')).toBe(`message-${message2Date1User1.id}`)
        expect(children[5].getAttribute('data-testid')).toBe(`sender-${userId2}`)
        expect(children[6].getAttribute('data-testid')).toBe(`message-${message1Date1User2.id}`)
        expect(children[7].getAttribute('data-testid')).toBe(`message-${message2Date1User2.id}`)
        expect(children[8].getAttribute('data-testid')).toBe(`date-${date2}`)
        expect(children[9].getAttribute('data-testid')).toBe(`sender-${userId1}`)
        expect(children[10].getAttribute('data-testid')).toBe(`message-${message1Date2User1.id}`)
        expect(children[11].getAttribute('data-testid')).toBe(`message-${message2Date2User1.id}`)
        expect(children[12].getAttribute('data-testid')).toBe(`sender-${userId2}`)
        expect(children[13].getAttribute('data-testid')).toBe(`message-${message1Date2User2.id}`)
        expect(children[14].getAttribute('data-testid')).toBe(`message-${message2Date2User2.id}`)
    })

    it('should should always render author after system message', () => {
        const userId = 1
        const date = '2025-12-12'
        const message1 = systemMessageFactory({
            created_by_id: userId,
            created_at: date,
        })
        const message2 = textMessageFactory({
            created_by_id: userId,
            created_at: date,
        })
        controller.messages.current = [
            message1,
            message2,
        ]
        const component = render(<MessageList />)
        const container = component.getByTestId('container')
        const children = container.children
        expect(children.length).toBe(5)
        expect(children[0].getAttribute('data-stub')).toBe('intersection')
        expect(children[1].getAttribute('data-testid')).toBe(`date-${date}`)
        expect(children[2].getAttribute('data-testid')).toBe(`system-message-${message1.id}`)
        expect(children[3].getAttribute('data-testid')).toBe(`sender-${userId}`)
        expect(children[4].getAttribute('data-testid')).toBe(`message-${message2.id}`)
    })

    it('should not render intersection observer if cant fetch next', () => {
        controller.canFetchNext.current = false
        const component = render(<MessageList />)
        const intersectionObserver = component.container.querySelector('[data-stub="intersection"]')
        expect(intersectionObserver).toBeFalsy()
    })

    it('should not render intersection observer if loading', () => {
        controller.isLoading.current = true
        const component = render(<MessageList />)
        const intersectionObserver = component.container.querySelector('[data-stub="intersection"]')
        expect(intersectionObserver).toBeFalsy()
    })
})
