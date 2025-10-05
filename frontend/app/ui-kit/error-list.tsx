interface Props {
    errors?: string[]
    maxErrors?: number
}

const ErrorList = (props: Props) => {
    const {
        errors,
        maxErrors = 1,
    } = props
    const getErrorsDisplay = (): string[] => {
        if (!errors?.length) {
            return []
        }
        return errors.slice(0, maxErrors)
    }
    return getErrorsDisplay().map((error, index) =>
        (
            <p key={index}>
                { error }
            </p>
        )
    )
}

export default ErrorList
