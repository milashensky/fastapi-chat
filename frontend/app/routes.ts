import {
    type RouteConfig,
    route,
    index,
    layout,
} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    layout("./auth/layout.tsx", [
        route("login", "./auth/login/login.tsx"),
        route("registration", "./auth/registration.tsx"),
    ]),
] satisfies RouteConfig;
