import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // API calls → backend
      '/api': {
        target: 'https://expense-tracker-backend-j36l.onrender.com',
        changeOrigin: true,
      },
      // Only proxy the OAuth2 LOGIN INITIATION (sends user to Google)
      // Do NOT proxy /oauth2/redirect — that is a React frontend route
      '/oauth2/authorization': {
        target: 'https://expense-tracker-backend-j36l.onrender.com',
        changeOrigin: true,
      },
      // Spring Security OAuth2 callback from Google → backend
      '/login/oauth2': {
        target: 'https://expense-tracker-backend-j36l.onrender.com',
        changeOrigin: true,
      },
    }
  }
})