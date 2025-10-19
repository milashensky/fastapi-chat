import { act, fireEvent } from '@testing-library/react'
import flushPromises from 'flush-promises'
import { describeComponent } from '~/test/unit/componentTest'
import ConfirmationDialog from '../confirmation-dialog'


describeComponent('ConfirmationDialog', ({ render }) => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()

    it('should call onConfirm and onClose when confirm button is clicked', async () => {
        const component = render(
            <ConfirmationDialog
                isShown={true}
                onConfirm={onConfirm}
                onClose={onClose}
                content="Are you sure?"
            />
        )
        const confirmBtn = component.getByTestId('confirm-button')
        await act(async () => {
            fireEvent.click(confirmBtn)
            await flushPromises()
        })
        expect(onConfirm).toHaveBeenCalled()
        expect(onClose).toHaveBeenCalled()
    })

    it('should call onClose when dismiss button is clicked', async () => {
        const component = render(
            <ConfirmationDialog
                isShown={true}
                onConfirm={onConfirm}
                onClose={onClose}
                content="Are you sure?"
            />
        )
        const dismissBtn = component.getByTestId('dismiss-button')
        await act(async () => fireEvent.click(dismissBtn))
        expect(onConfirm).not.toHaveBeenCalled()
        expect(onClose).toHaveBeenCalled()
    })

    it('should display title as text', () => {
        const title = 'Delete Item'
        const component = render(
            <ConfirmationDialog
                isShown={true}
                onConfirm={onConfirm}
                onClose={onClose}
                title={title}
            />
        )
        expect(component.getByText(title)).toBeInTheDocument()
    })

    it('should display title as node', () => {
        const title = <span data-testid="custom-title">Custom Title</span>
        const component = render(
            <ConfirmationDialog
                isShown={true}
                onConfirm={onConfirm}
                onClose={onClose}
                title={title}
            />
        )
        expect(component.getByTestId('custom-title')).toBeInTheDocument()
    })

    it('should display content', () => {
        const content = 'Are you sure you want to proceed?'
        const component = render(
            <ConfirmationDialog
                isShown={true}
                onConfirm={onConfirm}
                onClose={onClose}
                content={content}
            />
        )
        expect(component.getByText(content)).toBeInTheDocument()
    })

    it('should display children when content is not provided', () => {
        const component = render(
            <ConfirmationDialog
                isShown={true}
                onConfirm={onConfirm}
                onClose={onClose}
            >
                <div data-testid="custom-content">Custom content</div>
            </ConfirmationDialog>
        )
        expect(component.getByTestId('custom-content')).toBeInTheDocument()
    })

    it('should use custom confirmText', () => {
        const confirmText = 'Delete'
        const component = render(
            <ConfirmationDialog
                isShown={true}
                onConfirm={onConfirm}
                onClose={onClose}
                confirmText={confirmText}
            />
        )
        const confirmBtn = component.getByTestId('confirm-button')
        expect(confirmBtn.textContent).toBe(confirmText)
    })

    it('should use custom dismissText', () => {
        const dismissText = 'No'
        const component = render(
            <ConfirmationDialog
                isShown={true}
                onConfirm={onConfirm}
                onClose={onClose}
                dismissText={dismissText}
            />
        )
        const dismissBtn = component.getByTestId('dismiss-button')
        expect(dismissBtn.textContent).toBe(dismissText)
    })

    it('should apply custom color to confirm button', () => {
        const component = render(
            <ConfirmationDialog
                isShown={true}
                onConfirm={onConfirm}
                onClose={onClose}
                color="danger"
            />
        )
        const confirmBtn = component.getByTestId('confirm-button')
        expect(confirmBtn).toHaveClass('danger')
    })
})
