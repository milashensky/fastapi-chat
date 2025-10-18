import {
    type RouteConfig,
    route,
    index,
    layout,
} from '@react-router/dev/routes'


export default [
    layout('./auth/unauthenticated-layout.tsx', [
        route('login', './auth/login/login.tsx'),
        route('registration', './auth/registration.tsx'),
    ]),
    layout('./auth/auth-required-layout.tsx', [
        layout('./chat/layout.tsx', [
            route('chat/:roomId', './chat/chat-room/chat-view.tsx', [
                route('details', './chat/details/chat-details.tsx'),
            ]),
            index('routes/home.tsx'),
        ]),
        route('invite/:inviteId', './chat/invite/accept-invite.tsx'),
    ])
] satisfies RouteConfig
