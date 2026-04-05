import axios from 'axios'

const api = axios.create({
  baseURL: 'https://expense-tracker-backend-j36l.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → clear token and redirect to login
// But NOT during the OAuthRedirect flow (path starts with /oauth2)
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