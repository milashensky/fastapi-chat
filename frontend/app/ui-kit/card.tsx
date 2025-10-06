interface Props {
    children: React.ReactNode
    className?: string
    maxWidth?: number
}

const Card = (props: Props) => {
    return (
        <section
            className={props.className}
            style={
                {
                    maxWidth: props.maxWidth,
                }
            }
        >
            {props.children}
        </section>
    )
}

export default Card
