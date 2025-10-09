import { useUser } from "~/auth/use-user"
import SkeletonLoader from "~/ui-kit/skeleton-loader"

interface Props {
    userId: number | null
}

const MessageAuthor = ({ userId }: Props)=> {
    const user = useUser({ userId })
    return (
        <div className="message-author">
            {
                !user
                ? (
                    <SkeletonLoader />
                )
                : (
                    <b>
                        { user.name }
                    </b>
                )
            }
        </div>
    )
}

export default MessageAuthor
