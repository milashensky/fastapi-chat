import type { GenericProps } from '~/globals/types'
import { extractDataProps } from '~/utils/extractDataProps'
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
    children?: React.ReactNode
    onChange?: (value: T) => void
}

const Select = <T extends string | number>(props: Props<T>) => {
    const dataProps = extractDataProps(props)
    const {
        onChange,
        placeholder,
        options = []
    } = props
    const handleChange = (event: React.ChangeEvent) => {
        if (!onChange) {
            return
        }
        const value = event.currentTarget.nodeValue
        onChange(value as T)
    }
    const optionNodes = options.map((option) => (
        <option value={option.value}>
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
        </label>
    )
}

export default Select
