import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    proxy: {
      // Only used in LOCAL DEV — ignored in production build
      '/api': {
        target: 'https://expense-tracker-backend-j36l.onrender.com',
        changeOrigin: true,
      },
      '/oauth2/authorization': {
        target: 'https://expense-tracker-backend-j36l.onrender.com',
        changeOrigin: true,
      },
      '/login/oauth2': {
        target: 'https://expense-tracker-backend-j36l.onrender.com',
        changeOrigin: true,
      },
    }
  }
})