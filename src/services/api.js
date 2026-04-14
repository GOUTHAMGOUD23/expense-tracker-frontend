import axios from 'axios'

// Hardcoded production backend — no env var needed
const BACKEND_URL = import.meta.env.PROD
  ? 'https://expense-tracker-backend-j36l.onrender.com'
  : ''

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isOAuthFlow = window.location.pathname.startsWith('/oauth2')
      if (!isOAuthFlow) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export { BACKEND_URL }
export default api