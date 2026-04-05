import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),

  // OAuth2 Google — redirect to backend
  googleLogin: () => {
    window.location.href = '/oauth2/authorization/google'
  },

  // Called by OAuthRedirect page after token arrives in URL
  saveToken: (token) => {
    localStorage.setItem('token', token)
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getToken: () => localStorage.getItem('token'),
}

export const expenseService = {
  getAll:  (params) => api.get('/expenses', { params }),
  getById: (id)     => api.get(`/expenses/${id}`),
  create:  (data)   => api.post('/expenses', data),
  update:  (id, data) => api.put(`/expenses/${id}`, data),
  remove:  (id)     => api.delete(`/expenses/${id}`),
  recent:  (limit=5) => api.get('/expenses/recent', { params: { limit } }),
}

export const reportService = {
  summary:   (params) => api.get('/reports/summary', { params }),
  exportCsv: (params) => api.get('/reports/export/csv', { params, responseType: 'blob' }),
  exportPdf: (params) => api.get('/reports/export/pdf', { params, responseType: 'blob' }),
}

export const insightService = {
  monthly:   () => api.get('/insights/monthly'),
  ask:       (question) => api.post('/insights/ask', { question }),
  anomalies: () => api.get('/insights/anomalies'),
  budget:    () => api.get('/insights/budget'),
}