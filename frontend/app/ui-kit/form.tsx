interface Props {
    onSubmit?: () => void
    children: React.ReactNode
}

export default (props: Props) => {
    const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (props.onSubmit) {
            return props.onSubmit()
        }
    }
    return (
        <form
            onSubmit={handleSubmit}
        >
            {props.children}
        </form>
    )
}
