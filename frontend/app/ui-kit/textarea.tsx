interface Props {
    value?: string
    label?: string
    placeholder?: string
    disabled?: boolean
    rows?: number
    cols?: number
    onInput?: (value: string) => void
}

export default (props: Props) => {
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
                value={props.value}
                placeholder={props.placeholder}
                disabled={props.disabled}
                rows={props.rows}
                cols={props.cols}
                onInput={handleInput}
            />
        </label>
    )
}
