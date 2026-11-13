import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Проксируем /api и /media на Django
      '/api': {
        target: 'http://127.0.0.1:8005',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8005',
        changeOrigin: true,
      },
    },
  },
})
