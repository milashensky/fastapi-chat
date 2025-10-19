import { act, fireEvent } from '@testing-library/react'
import { RoomRoleEnum } from '~/chat/types'
import { describeComponent } from '~/test/unit/componentTest'
import { roomRoleFactory } from '~/test/factories/roomRole'
import EditRoleForm from '../edit-role-form'
import * as controller from '../use-role-edit'


vi.mock('../use-role-edit')

describeComponent('EditRoleForm', ({ render }) => {
    const member = roomRoleFactory()

    it('should call submit on form submit', () => {
        const onBack = vi.fn()
        const component = render(
            <EditRoleForm
                member={member}
                onBack={onBack}
            />
        )
        const submitBtn = component.getByTestId('submit')
        expect(submitBtn).not.toHaveAttribute('disabled')
        act(() => {
            fireEvent.click(submitBtn)
        })
        expect(controller.submit).toHaveBeenCalled()
    })

    it('should call onBack on cancel button click', () => {
        const onBack = vi.fn()
        const component = render(
            <EditRoleForm
                member={member}
                onBack={onBack}
            />
        )
        const cancelBtn = component.getByTestId('reset')
        expect(cancelBtn).not.toHaveAttribute('disabled')
        act(() => {
            fireEvent.click(cancelBtn)
        })
        expect(onBack).toHaveBeenCalled()
    })

    it('should disable fields if form is pending', () => {
        controller.isPending.current = true
        const onBack = vi.fn()
        const component = render(
            <EditRoleForm
                member={member}
                onBack={onBack}
            />
        )
        const submitBtn = component.getByTestId('submit')
        expect(submitBtn).toHaveAttribute('disabled')
        const cancelBtn = component.getByTestId('reset')
        expect(cancelBtn).toHaveAttribute('disabled')
        const selectInput = component.getByTestId('role-select')
        expect(selectInput).toHaveAttribute('disabled')
    })

    it('should change role when select value changes', () => {
        const onBack = vi.fn()
        const component = render(
            <EditRoleForm
                member={member}
                onBack={onBack}
            />
        )
        const selectInput = component.getByTestId('role-select')
        act(() => {
            fireEvent.change(selectInput, { target: { value: RoomRoleEnum.ADMIN } })
        })
        expect(selectInput.value).toBe(RoomRoleEnum.ADMIN)
    })
})
