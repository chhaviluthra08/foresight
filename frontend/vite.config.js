import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Where the FastAPI backend listens during local development.
// 127.0.0.1 (not "localhost") avoids Node resolving to IPv6 ::1 while uvicorn
// only listens on IPv4.
const API_TARGET = process.env.API_TARGET || 'http://127.0.0.1:8000'

const apiProxy = {
  '/api': { target: API_TARGET, changeOrigin: true },
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
