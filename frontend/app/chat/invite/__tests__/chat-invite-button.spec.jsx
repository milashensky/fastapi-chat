import { act, fireEvent } from '@testing-library/react'
import flushPromises from 'flush-promises'
import { useChatsStore } from '~/chat/chats-store'
import { describeComponent } from '~/test/unit/componentTest'
import ChatInviteButton from '../chat-invite-button'


vi.mock('zustand')

describeComponent('ChatInviteButton', ({ render }) => {
    const clipboardMock = {
        writeText: vi.fn(),
    }

    beforeAll(() => {
        Object.defineProperty(window, 'navigator', {
            value: {
                clipboard: clipboardMock,
            },
        })
        Object.defineProperty(window, 'location', {
            value: {
                origin: 'http://localhost:3000',
            },
        })
        Object.defineProperty(window, 'alert', {
            value: vi.fn(),
        })
    })

    it('should create invite and copy link to clipboard when clicked', async () => {
        const inviteId = 'test-invite-123'
        const createChatInviteMock = vi.fn().mockResolvedValue({ id: inviteId })
        useChatsStore.setState({
            createChatInvite: createChatInviteMock,
        })
        const roomId = 456
        const props = { roomId }
        const component = render(<ChatInviteButton {...props} />)
        const button = component.getByText('Invite more people')
        await act(async () => {
            fireEvent.click(button)
            await flushPromises()
        })
        expect(createChatInviteMock).toHaveBeenCalledWith(roomId)
        expect(clipboardMock.writeText).toHaveBeenCalledWith(`http://localhost:3000/invite/${inviteId}`)
    })
})
