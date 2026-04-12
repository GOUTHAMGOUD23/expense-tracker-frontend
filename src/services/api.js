import axios from 'axios'

// ─────────────────────────────────────────────────────────────────────────────
// BACKEND URL CONFIGURATION
//
// LOCAL DEV:  Leave VITE_API_URL empty → Vite proxy forwards /api to localhost:8080
// PRODUCTION: Set VITE_API_URL in your Render frontend environment variables:
//             VITE_API_URL = https://your-backend-name.onrender.com
//
// How to set on Render:
//   1. Go to your Frontend service on render.com
//   2. Environment → Add Environment Variable
//   3. Key: VITE_API_URL
//   4. Value: https://your-backend-name.onrender.com   (no trailing slash)
// ─────────────────────────────────────────────────────────────────────────────
const BACKEND_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isOAuthFlow = window.location.pathname.startsWith('/oauth2')
      if (!isOAuthFlow) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
export { BACKEND_URL }