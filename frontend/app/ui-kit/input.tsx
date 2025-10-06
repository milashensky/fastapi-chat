import ErrorList from '~/ui-kit/error-list'
import { useFormValidator, type FieldValidator } from './form'

interface Props <T = string>{
    value?: T
    label?: string
    errors?: string[]
    placeholder?: string
    disabled?: boolean
    type?: string
    rules?: FieldValidator<T>[]
    onInput?: (value: T) => void
}

export default (props: Props) => {
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
                value={props.value}
                placeholder={props.placeholder}
                disabled={props.disabled}
                type={props.type}
                onInput={handleInput}
            />
            <ErrorList errors={allErrors} />
        </label>
    )
}
