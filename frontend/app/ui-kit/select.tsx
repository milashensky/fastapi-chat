import type { GenericProps } from '~/globals/types'
import { extractDataProps } from '~/utils/extractDataProps'
import ErrorList from './error-list'
import {
    useFormValidator,
    type FieldValidator
} from './form'
import './styles/select.scss'


interface Option<T> {
    value: T
    label: string
}

interface Props <T> extends GenericProps {
    value?: T
    name?: string
    id?: string
    disabled?: boolean
    placeholder?: string
    label?: string
    options?: Option<T>[]
    errors?: string[]
    children?: React.ReactNode
    rules?: FieldValidator<T>[]
    onChange?: (value: T) => void
}

const Select = <T extends string | number>(props: Props<T>) => {
    const dataProps = extractDataProps(props)
    const {
        onChange,
        placeholder,
        options = []
    } = props
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (!onChange) {
            return
        }
        const value = event.target.value
        onChange(value as T)
    }
    const optionNodes = options.map((option, index) => (
        <option
            key={index}
            value={option.value}
        >
            {option.label}
        </option>
    ))
    const placeholderNode = (
        placeholder
            ? (
                <option
                    disabled
                >
                    {placeholder}
                </option>
            )
            : null
    )
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
            {props.label}
            <select
                value={props.value}
                name={props.name}
                id={props.id}
                disabled={props.disabled}
                onChange={handleChange}
                { ...dataProps }
            >
                {placeholderNode}
                {optionNodes}
                {props.children}
            </select>
            <ErrorList errors={allErrors} />
        </label>
    )
}

export default Select
