import { useCallback, useEffect, useRef } from "react"
import './styles/dialog.scss'

interface Props {
    isShown?: boolean
    children: React.ReactNode
    onShow?: () => void
    onHide?: () => void
}

const Dialog = (props: Props) => {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const show = () => {
        const dialog = dialogRef.current
        if (!dialog) {
            return
        }
        dialog.showModal()
        if (props.onShow) {
            props.onShow()
        }
    }
    const hide = useCallback(() => {
        const dialog = dialogRef.current
        if (!dialog) {
            return
        }
        dialog.close()
        if (props.onHide) {
            props.onHide()
        }
    }, [])
    useEffect(() => {
        if (!props.isShown) {
            hide()
            return
        }
        show()
        return
    }, [props.isShown])

    useEffect(() => {
        if (!dialogRef.current) {
            return
        }
        dialogRef.current.addEventListener('close', hide)
        return () => {
            if (!dialogRef.current) {
                return
            }
            dialogRef.current.removeEventListener('close', hide)
        }
    }, [dialogRef.current])
    return (
        <dialog
            ref={dialogRef}
            // @ts-ignore it's actually a valid prop, grow up
            closedby="any"
        >
            {props.children}
        </dialog>
    )
}

export default Dialog
