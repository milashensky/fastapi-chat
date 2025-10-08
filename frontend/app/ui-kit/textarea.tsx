import type { GenericProps } from '~/globals/types'
import { extractDataProps } from '~/utils/extractDataProps'
import ErrorList from '~/ui-kit/error-list'

interface Props extends GenericProps {
    value?: string
    label?: string
    name?: string
    placeholder?: string
    disabled?: boolean
    rows?: number
    cols?: number
    errors?: string[]
    onInput?: (value: string) => void
}

export default (props: Props) => {
    const dataProps = extractDataProps(props)
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
                {...dataProps}
                value={props.value}
                placeholder={props.placeholder}
                disabled={props.disabled}
                name={props.name}
                rows={props.rows}
                cols={props.cols}
                onInput={handleInput}
            />
            <ErrorList errors={props.errors} />
        </label>
    )
}
