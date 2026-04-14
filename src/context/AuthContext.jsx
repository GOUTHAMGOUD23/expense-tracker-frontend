import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const token = authService.getToken()
    if (!token) { setLoading(false); return null }
    try {
      const { data } = await authService.me()
      setUser(data)
      return data
    } catch (err) {
      console.error('fetchMe failed:', err?.response?.status)
      authService.logout()
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    authService.saveToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const { data } = await authService.register(payload)
    authService.saveToken(data.token)
    setUser(data.user)
    return data
  }

  const loginWithOAuth = async (token) => {
    setLoading(true)
    authService.saveToken(token)
    return await fetchMe()
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithOAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}