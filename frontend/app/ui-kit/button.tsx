import type { GenericProps } from '~/globals/types'
import { extractDataProps } from '~/utils/extractDataProps'


export type ButtonColor = 'primary' | 'secondary' | 'danger'

interface Props extends GenericProps {
    className?: string
    type?: 'submit' | 'reset' | 'button'
    disabled?: boolean
    icon?: boolean
    onClick?: () => void
    children: React.ReactNode
    color?: ButtonColor
}

export default (props: Props) => {
    const dataProps = extractDataProps(props)
    const classes = [
        props.icon && 'icon',
        props.color,
        props.className,
    ].join(' ')
    return (
        <button
            {...dataProps}
            disabled={props.disabled}
            type={props.type}
            className={classes}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    )
}
