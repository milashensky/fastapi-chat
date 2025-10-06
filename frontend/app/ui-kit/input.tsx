import ErrorList from '~/ui-kit/error-list'
import { useFormValidator, type FieldValidator } from './form'
// import "./styles/input.scss"

interface Props <T = string>{
    id?: string
    name?: string
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
                id={props.id}
                name={props.name}
                value={props.value}
                placeholder={props.placeholder}
                disabled={props.disabled}
                type={props.type}
                aria-invalid={allErrors.length > 0}
                onInput={handleInput}
            />
            <ErrorList errors={allErrors} />
        </label>
    )
}
