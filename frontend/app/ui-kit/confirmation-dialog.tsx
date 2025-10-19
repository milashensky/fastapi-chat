import { useState } from 'react'
import Button, { type ButtonColor } from './button'
import Dialog from './dialog'
import Card from './card'


interface Props {
    isShown?: boolean
    onConfirm: () => void | Promise<void>
    onClose: () => void
    title?: React.ReactNode
    content?: React.ReactNode
    children?: React.ReactNode
    color?: ButtonColor
    confirmText?: string
    dismissText?: string
}

const ConfirmationDialog = (props: Props) => {
    const {
        isShown,
        onConfirm,
        onClose,
        title = 'Are you sure?',
        content,
        children,
        color = 'primary',
        confirmText = 'Confirm',
        dismissText = 'Cancel',
    } = props
    const [isPending, setPending] = useState(false)
    const handleConfirm = async () => {
        setPending(true)
        try {
            await onConfirm()
            onClose()
        }
        finally {
            setPending(false)
        }
    }
    return (
        <Dialog
            isShown={isShown}
            onHide={onClose}
        >
            <Card maxWidth={400}>
                <h2>
                    {title}
                </h2>
                <div className="mb-3">
                    {
                        content
                        && (
                            <p>
                                {content}
                            </p>
                        )
                    }
                    {children}
                </div>
                <div className="flex gap-2">
                    <Button
                        color={color}
                        disabled={isPending}
                        data-testid="confirm-button"
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </Button>
                    <Button
                        color="secondary"
                        disabled={isPending}
                        data-testid="dismiss-button"
                        onClick={onClose}
                    >
                        {dismissText}
                    </Button>
                </div>
            </Card>
        </Dialog>
    )
}

export default ConfirmationDialog
