import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Insights from './pages/Insights'
import OAuthRedirect from './pages/OAuthRedirect'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="loader-full">
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="loader-full">
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )
  return user ? <Navigate to="/" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
     <Route path="/oauth2/redirect" element={<OAuthRedirect />} />
      <Route path="/"       element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/insights" element={<PrivateRoute><Insights /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="noise" />
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111118',
              color: '#f0f0f8',
              border: '1px solid #1e1e2e',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 14,
            },
            success: { iconTheme: { primary: '#22d3a0', secondary: '#111118' } },
            error:   { iconTheme: { primary: '#f26b6b', secondary: '#111118' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}