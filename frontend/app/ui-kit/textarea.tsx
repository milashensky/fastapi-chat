import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import type { GenericProps } from '~/globals/types'
import { extractDataProps } from '~/utils/extractDataProps'
import ErrorList from '~/ui-kit/error-list'


export interface TextareaRef {
    focus: () => void
}

interface Props extends GenericProps {
    id?: string
    className?: string
    autoGrow?: boolean
    ref?: Ref<TextareaRef>
    name?: string
    value?: string
    label?: string
    placeholder?: string
    disabled?: boolean
    rows?: number
    cols?: number
    autoFocus?: boolean
    errors?: string[]
    onInput?: (value: string) => void
}

export default (props: Props) => {
    const elRef = useRef<HTMLTextAreaElement>(null)
    const focus = () => {
        const element = elRef.current
        if (!element) {
            return
        }
        element.focus()
    }
    useImperativeHandle(props.ref, () => ({
        focus,
    }), [props.ref])
    useEffect(() => {
        if (!props.autoGrow) {
            return
        }
        const element = elRef.current
        if (!element) {
            return
        }
        element.style.height = '1px'
        element.style.height = `${element.scrollHeight}px`
    }, [props.value, props.autoGrow])
    const genericProps = extractDataProps(props)
    const handleInput = (e: React.InputEvent<HTMLTextAreaElement>) => {
        if (!props.onInput) {
            return
        }
        props.onInput(e.currentTarget.value)
    }
    return (
        <label>
            { props.label }
            <textarea
                {...genericProps}
                ref={elRef}
                className={props.className}
                id={props.id}
                name={props.name}
                autoFocus={props.autoFocus}
                value={props.value}
                placeholder={props.placeholder}
                disabled={props.disabled}
                rows={props.rows}
                cols={props.cols}
                onInput={handleInput}
            />
            <ErrorList errors={props.errors} />
        </label>
    )
}
