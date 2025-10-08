import {
    type RouteConfig,
    route,
    index,
    layout,
} from "@react-router/dev/routes";

export default [
    layout("./auth/unauthenticated-layout.tsx", [
        route("login", "./auth/login/login.tsx"),
        route("registration", "./auth/registration.tsx"),
    ]),
    layout("./auth/auth-required-layout.tsx", [
        layout('./chat/layout.tsx', [
            route("chat/:roomId", "./chat/details/chat-view.tsx"),
            index("routes/home.tsx"),
        ])
    ])
] satisfies RouteConfig;
