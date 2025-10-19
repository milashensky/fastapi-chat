import flushPromises from 'flush-promises'
import { act, fireEvent } from '@testing-library/react'
import { describeComponent } from '~/test/unit/componentTest'
import { roomRoleFactory } from '~/test/factories/roomRole'
import { useChatsStore } from '~/chat/chats-store'
import DeleteMemberButton from '../delete-member-button'


describeComponent('DeleteMemberButton', ({ render }) => {
    const member = roomRoleFactory()

    it('should trigger delete action on confirm click', async () => {
        const deleteRoomRole = vi.fn()
        useChatsStore.setState({
            deleteRoomRole,
        })
        const component = render(
            <DeleteMemberButton
                member={member}
            />
        )
        const confirmButton = component.getByTestId('confirm-button')
        expect(confirmButton).toBeTruthy()
        await act(async () => {
            fireEvent.click(confirmButton)
            await flushPromises()
        })
        expect(deleteRoomRole).toHaveBeenCalledWith(member.id)
    })
})
