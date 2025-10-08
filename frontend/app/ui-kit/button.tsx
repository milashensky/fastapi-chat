import type { GenericProps } from '~/globals/types'
import { extractDataProps } from '~/utils/extractDataProps'

interface Props extends GenericProps {
    type?: "submit" | "reset" | "button"
    disabled?: boolean
    onClick?: () => void
    children: React.ReactNode
    color?: "primary" | "secondary"
}

export default (props: Props) => {
    const dataProps = extractDataProps(props)
    return (
        <button
            {...dataProps}
            disabled={props.disabled}
            type={props.type}
            className={props.color}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    )
}
