interface Props {
    type?: "submit" | "reset" | "button"
    disabled?: boolean
    onClick?: () => void
    children: React.ReactNode
}

export default (props: Props) => {
    return (
        <button
            disabled={props.disabled}
            type={props.type}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    )
}
