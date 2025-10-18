import flushPromises from 'flush-promises'
import { act } from '@testing-library/react'
import { useChatsStore } from '~/chat/chats-store'
import { chatRoomFactory } from '~/test/factories/chatRoom'
import { describeComponent } from '~/test/unit/componentTest'
import { AlreadyInRoomError, InviteExpiredError } from '~/chat/invite-errors'
import AcceptInvite, { clientLoader } from '../accept-invite'


vi.mock('zustand')

describeComponent('AcceptInvite', ({ render, reactRouter }) => {
    it('should accept invite and redirect user to the chat page', async () => {
        const chatRoom = chatRoomFactory()
        const acceptChatInvite = vi.fn().mockResolvedValue(chatRoom)
        const navigateMock = vi.fn()
        useChatsStore.setState({
            acceptChatInvite,
        })
        vi.spyOn(reactRouter, 'useNavigate').mockReturnValue(navigateMock)
        const inviteId = 'test-invite-id'
        const props = {
            loaderData: {
                inviteId,
            },
        }
        render(<AcceptInvite {...props} />)
        await act(async () => {
            await flushPromises()
        })
        expect(acceptChatInvite).toHaveBeenCalledTimes(1)
        expect(acceptChatInvite).toHaveBeenCalledWith(inviteId)
        expect(navigateMock).toHaveBeenCalledTimes(1)
        expect(navigateMock).toHaveBeenCalledWith(`/chat/${chatRoom.id}`)
    })

    it('should redirect to chat room when already in room error occurs', async () => {
        const chatRoomId = 456
        const acceptChatInvite = vi.fn().mockRejectedValue(
            new AlreadyInRoomError('Already in room', chatRoomId)
        )
        const navigateMock = vi.fn()
        useChatsStore.setState({
            acceptChatInvite,
        })
        vi.spyOn(reactRouter, 'useNavigate').mockReturnValue(navigateMock)
        const inviteId = 'test-invite-id'
        const props = {
            loaderData: {
                inviteId,
            },
        }
        render(<AcceptInvite {...props} />)
        await act(async () => {
            await flushPromises()
        })
        expect(acceptChatInvite).toHaveBeenCalledTimes(1)
        expect(acceptChatInvite).toHaveBeenCalledWith(inviteId)
        expect(navigateMock).toHaveBeenCalledTimes(1)
        expect(navigateMock).toHaveBeenCalledWith(`/chat/${chatRoomId}`)
    })

    it('should show expired message when invite is expired', async () => {
        const acceptChatInvite = vi.fn().mockRejectedValue(
            new InviteExpiredError('Invite is expired')
        )
        const navigateMock = vi.fn()
        useChatsStore.setState({
            acceptChatInvite,
        })
        vi.spyOn(reactRouter, 'useNavigate').mockReturnValue(navigateMock)
        const inviteId = 'test-invite-id'
        const props = {
            loaderData: {
                inviteId,
            },
        }
        const component = render(<AcceptInvite {...props} />)
        await act(async () => {
            await flushPromises()
        })
        expect(acceptChatInvite).toHaveBeenCalledTimes(1)
        expect(acceptChatInvite).toHaveBeenCalledWith(inviteId)
        expect(navigateMock).not.toHaveBeenCalled()
        expect(component.getByText('Invite is expired')).toBeInTheDocument()
    })
})

describe('clientLoader', () => {
    it('should return inviteId from params', async () => {
        const args = {
            params: { inviteId: 'test-invite-123' },
        }
        const result = await clientLoader(args)
        expect(result).toEqual({
            inviteId: 'test-invite-123',
        })
    })

    it('should return default inviteId when none provided', async () => {
        const args = {
            params: {},
        }
        const result = await clientLoader(args)
        expect(result).toEqual({
            inviteId: '0',
        })
    })
})
