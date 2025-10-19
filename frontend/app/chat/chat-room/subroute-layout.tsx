import { useContext } from 'react'
import {
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
    useMatches,
} from 'react-router'
import Card from '~/ui-kit/card'
import Dialog from '~/ui-kit/dialog'
import { CHAT_BASE_ROUTE } from '~/utils/constants'
import { chatRoomContext } from './chat-room-context'
import Button from '~/ui-kit/button'
import Icon from '~/ui-kit/icon'


interface WithTitle {
    title: string
}

const HeaderTitle = () => {
    const matches = useMatches()
    const current = matches.find((m) => (m.handle as WithTitle)?.title)
    const title = (current?.handle as WithTitle)?.title
    return (
        <h2>
            {title}
        </h2>
    )
}

export const MobileLayout = () => {
    const { roomId } = useContext(chatRoomContext)
    return (
        <div className="flex flex-col flex-1 h-full p-4">
            <div className="flex gap-4">
                <NavLink
                    to={`${CHAT_BASE_ROUTE}/${roomId}`}
                >
                    <Button
                        color="secondary"
                    >
                        <Icon icon="back" />
                        Back
                    </Button>
                </NavLink>
                <HeaderTitle />
            </div>
            <div className="flex flex-col flex-1">
                <Outlet />
            </div>
        </div>
    )
}

interface DialogProps {
    isShown: boolean
}

export const DialogLayout = ({ isShown }: DialogProps) => {
    const { roomId } = useContext(chatRoomContext)
    const navigate = useNavigate()
    const goBack = () => {
        navigate(`${CHAT_BASE_ROUTE}/${roomId}`)
    }
    return (
        <Dialog
            isShown={isShown}
            onHide={goBack}
        >
            <Card
                className="w-screen"
                maxWidth={400}
            >
                <div className="flex gap-4 justify-between">
                    <HeaderTitle />
                    <Button
                        icon
                        color="secondary"
                        onClick={goBack}
                    >
                        <Icon icon="close" />
                    </Button>
                </div>
                <div className="flex flex-col flex-1">
                    <Outlet />
                </div>
            </Card>
        </Dialog>
    )
}

interface LayoutProps {
    children: React.ReactNode,
}

const SubrouteLayout = (props: LayoutProps) => {
    const { roomId } = useContext(chatRoomContext)
    const isMobile = window.innerWidth < 600
    const location = useLocation()
    const isLayout = !location.pathname.endsWith(`${CHAT_BASE_ROUTE}/${roomId}`)
    return (
        (
            isMobile
                ? (
                    isLayout
                        ? (
                            <MobileLayout />
                        )
                        : props.children
                )
                : (
                    <div className="contents">
                        <DialogLayout
                            isShown={isLayout}
                        />
                        { props.children }
                    </div>
                )
        )
    )
}

export default SubrouteLayout
