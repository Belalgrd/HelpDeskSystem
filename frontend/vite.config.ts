import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5179',
                changeOrigin: true,
                secure: false,
            },
            '/hubs': {
                target: 'http://localhost:5179',
                changeOrigin: true,
                secure: false,
                ws: true,
            },
        },
    },
    // ✅ ADD: Build configuration
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});