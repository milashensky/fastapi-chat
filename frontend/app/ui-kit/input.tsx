interface Props <T = string>{
    value?: T
    label?: string
    errors?: string[]
    placeholder?: string
    disabled?: boolean
    type?: string
    onInput?: (value: T) => void
}

export default (props: Props) => {
    const handleInput = (e: React.InputEvent<HTMLInputElement>) => {
        if (!props.onInput) {
            return
        }
        props.onInput(e.currentTarget.value)
    }
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
        </label>
    )
}
