import './styles/icon.scss'

const iconMap = {
    'close': 'fa-solid fa-xmark',
    'back': 'fa-solid fa-chevron-left',
    'send': 'fa-solid fa-paper-plane rotate-45',
    'vertical-ellipsis': 'fa-solid fa-ellipsis-vertical',
    'search': 'fa-solid fa-magnifying-glass',
} as const

interface Props {
    icon: keyof typeof iconMap
    size?: number
    className?: string
}

const Icon = (props: Props) => {
    const iconClass = iconMap[props.icon]
    const classes = [
        'icon',
        props.className,
        iconClass,
    ].join(' ')
    const style = {
        fontSize: props.size ? props.size : 'inherit',
    }
    return (
        <i
            className={classes}
            style={style}
        />
    )
}

export default Icon
