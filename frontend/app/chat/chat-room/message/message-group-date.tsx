import './styles/message-group-date.scss'
import { formatDateRelative } from '~/utils/datetime'


interface Props {
    date: string
}

const MessageGroupDate = ({ date }: Props) => {
    return (
        <div
            className="message-group-date"
            data-testid={`date-${date}`}
        >
            <p className="date">
                {formatDateRelative(date)}
            </p>
        </div>
    )
}

export default MessageGroupDate
