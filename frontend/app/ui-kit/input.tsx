import ErrorList from '~/ui-kit/error-list'
import { extractDataProps } from '~/utils/extractDataProps'
import { useFormValidator, type FieldValidator } from './form'
import type { GenericProps } from '~/globals/types'
// import "./styles/input.scss"

interface Props <T = string> extends GenericProps {
    id?: string
    name?: string
    value?: T
    label?: string
    errors?: string[]
    placeholder?: string
    disabled?: boolean
    autoFocus?: boolean
    type?: string
    rules?: FieldValidator<T>[]
    onInput?: (value: T) => void
}

export default (props: Props) => {
    const dataProps = extractDataProps(props)
    const {
        type = 'text'
    } = props
    const handleInput = (e: React.InputEvent<HTMLInputElement>) => {
        if (!props.onInput) {
            return
        }
        props.onInput(e.currentTarget.value)
    }
    const {
        errors,
    } = useFormValidator({
        value: props.value,
        rules: props.rules,
    })
    const allErrors = [
        ...errors.current,
        ...props.errors ?? [],
    ]
    return (
        <label>
            { props.label }
            <input
                {...dataProps}
                id={props.id}
                name={props.name}
                autoFocus={props.autoFocus}
                value={props.value}
                placeholder={props.placeholder}
                disabled={props.disabled}
                type={type}
                aria-invalid={allErrors.length > 0}
                onInput={handleInput}
            />
            <ErrorList errors={allErrors} />
        </label>
    )
}
