import { useAuthStore } from '~/auth/auth-store'
import { useChatsStore } from '~/chat/chats-store'
import { RoomRoleEnum } from '~/chat/types'
import { describeComponent } from '~/test/unit/componentTest'
import { chatRoomFactory } from '~/test/factories/chatRoom'
import { chatRoleFactory } from '~/test/factories/chatRole'
import ChatRoleRequired from '../chat-role-required'


describeComponent('ChatRoleRequired', ({ render }) => {
    it.each([
        {
            userId: 1,
            userRole: RoomRoleEnum.ADMIN,
            allowFor: [RoomRoleEnum.ADMIN],
            roomId: 100,
        },
        {
            userId: 2,
            userRole: RoomRoleEnum.MODERATOR,
            allowFor: [RoomRoleEnum.MODERATOR, RoomRoleEnum.ADMIN],
            roomId: 101,
        },
    ])('should render children if user has required role in chat', (context) => {
        const {
            userId,
            userRole,
            allowFor,
            roomId,
        } = context
        useAuthStore.setState({ userId })
        useChatsStore.setState({
            chatRooms: {
                [roomId]: chatRoomFactory({
                    id: roomId,
                    roles: [
                        chatRoleFactory({
                            user_id: userId,
                            chat_room_id: roomId,
                            role: userRole,
                        }),
                    ],
                }),
            },
        })
        const component = render(
            <ChatRoleRequired
                allowFor={allowFor}
                roomId={roomId}
                notAllowed={<div>Not Allowed</div>}
            >
                <div>Allowed Content</div>
            </ChatRoleRequired>
        )
        expect(component.queryByText('Allowed Content')).toBeInTheDocument()
        expect(component.queryByText('Not Allowed')).not.toBeInTheDocument()
    })

    it.each([
        {
            userId: 1,
            userRole: RoomRoleEnum.USER,
            allowFor: [RoomRoleEnum.ADMIN],
            roomId: 200,
        },
        {
            userId: 2,
            userRole: RoomRoleEnum.USER,
            allowFor: [RoomRoleEnum.MODERATOR, RoomRoleEnum.ADMIN],
            roomId: 201,
        },
    ])("should render notAllowed if user doesn't has required role in chat", (context) => {
        const {
            userId,
            userRole,
            allowFor,
            roomId,
        } = context

        useAuthStore.setState({ userId })
        useChatsStore.setState({
            chatRooms: {
                [roomId]: chatRoomFactory({
                    id: roomId,
                    roles: [
                        chatRoleFactory({
                            user_id: userId,
                            chat_room_id: roomId,
                            role: userRole,
                        }),
                    ],
                }),
            },
        })
        const component = render(
            <ChatRoleRequired
                allowFor={allowFor}
                roomId={roomId}
                notAllowed={<div>Not Allowed</div>}
            >
                <div>Allowed Content</div>
            </ChatRoleRequired>
        )
        expect(component.queryByText('Not Allowed')).toBeInTheDocument()
        expect(component.queryByText('Allowed Content')).not.toBeInTheDocument()
    })

    const userId = 1
    const roomId = 420

    it('should render notAllowed if user has no role in chat', () => {
        useAuthStore.setState({ userId })
        useChatsStore.setState({
            chatRooms: {
                [roomId]: chatRoomFactory({
                    id: roomId,
                    roles: [
                        chatRoleFactory({
                            id: 999,
                        }),
                    ],
                }),
            },
        })
        const component = render(
            <ChatRoleRequired
                allowFor={[RoomRoleEnum.ADMIN]}
                roomId={roomId}
                notAllowed={<div>Not Allowed</div>}
            >
                <div>Allowed Content</div>
            </ChatRoleRequired>
        )
        expect(component.queryByText('Not Allowed')).toBeInTheDocument()
        expect(component.queryByText('Allowed Content')).not.toBeInTheDocument()
    })

    it('should render notAllowed if no chat is stored', () => {
        useAuthStore.setState({ userId })
        useChatsStore.setState({
            chatRooms: {
                999: chatRoomFactory(),
            },
        })
        const component = render(
            <ChatRoleRequired
                allowFor={[RoomRoleEnum.ADMIN]}
                roomId={roomId}
                notAllowed={<div>Not Allowed</div>}
            >
                <div>Allowed Content</div>
            </ChatRoleRequired>
        )
        expect(component.queryByText('Not Allowed')).toBeInTheDocument()
        expect(component.queryByText('Allowed Content')).not.toBeInTheDocument()
    })

    it('should render notAllowed if no authenticated user', () => {
        useAuthStore.setState({ userId: null })
        useChatsStore.setState({
            chatRooms: {
                [roomId]: chatRoomFactory({
                    id: roomId,
                    roles: [
                        chatRoleFactory({
                            user_id: userId,
                            chat_room_id: roomId,
                            role: RoomRoleEnum.ADMIN,
                        }),
                    ],
                }),
            },
        })
        const component = render(
            <ChatRoleRequired
                allowFor={[RoomRoleEnum.ADMIN]}
                roomId={roomId}
                notAllowed={<div>Not Allowed</div>}
            >
                <div>Allowed Content</div>
            </ChatRoleRequired>
        )
        expect(component.queryByText('Not Allowed')).toBeInTheDocument()
        expect(component.queryByText('Allowed Content')).not.toBeInTheDocument()
    })
})
