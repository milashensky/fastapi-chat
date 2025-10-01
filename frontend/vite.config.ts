/// <reference types="vitest" />
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [
        process.env.VITEST ? react() : reactRouter(),
        tailwindcss(),
        tsconfigPaths(),
    ],
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./app"),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./setup-vitest.ts'],
    },
});
