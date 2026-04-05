import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="auth-root">
      {/* ── Left Panel ── */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-grid" />
        <div className="auth-left-orb-1" />
        <div className="auth-left-orb-2" />

        <div className="auth-left-content">
          <div className="logo" style={{ marginBottom: 48 }}>
            <div className="logo-mark">S</div>
            <span className="logo-text">Spendly</span>
          </div>

          <h1 className="auth-tagline">
            Your money,<br/>
            <span className="auth-tagline-accent">crystal clear.</span>
          </h1>
          <p className="auth-sub">
            AI-powered expense tracking that surfaces insights you'd never find manually — in seconds.
          </p>

          <div className="feature-list">
            {[
              ['Smart categorisation', 'Auto-tags every expense'],
              ['Anomaly detection', 'Flags unusual spending instantly'],
              ['AI budget coach', 'Personalised monthly targets'],
              ['PDF & CSV export', 'One-click financial reports'],
            ].map(([title, desc]) => (
              <div className="feature-item" key={title}>
                <div className="feature-dot"><div className="feature-dot-inner" /></div>
                <p className="feature-text"><strong>{title}</strong> — {desc}</p>
              </div>
            ))}
          </div>

          <div className="auth-stats">
            {[['Free','Always'],['AI Insights','Claude / GPT'],['Secure','JWT + OAuth2']].map(([v,l]) => (
              <div className="auth-stat" key={v}>
                <div className="auth-stat-val">{v}</div>
                <div className="auth-stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right">
        <div className="auth-form-wrap fade-in">
          <div className="form-header">
            <h2 className="form-title">Sign in</h2>
            <p className="form-subtitle">Welcome back — let's pick up where you left off</p>
          </div>

          {error && (
            <div className="alert-error" style={{
              flexDirection: 'column', gap: 10,
              ...(error.toLowerCase().includes('google') ? {
                background: 'rgba(66,133,244,0.08)',
                borderColor: 'rgba(66,133,244,0.3)',
                color: '#60a5fa'
              } : {})
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
              {error.toLowerCase().includes('google') && (
                <button className="btn-google" style={{ marginTop: 4 }}
                  onClick={() => authService.googleLogin()}>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google instead
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-wrap">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={set('email')} required autoComplete="email" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={form.password} onChange={set('password')} required autoComplete="current-password" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg"
              disabled={loading} style={{ marginTop: 4, width: '100%' }}>
              {loading ? <><span className="spinner" /> Signing in…</> : 'Sign in to Spendly'}
            </button>
          </form>

          <div className="divider">
            <span className="divider-line" /><span className="divider-text">or</span><span className="divider-line" />
          </div>

          <button className="btn-google" onClick={() => authService.googleLogin()}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="switch-text">
            Don't have an account?{' '}
            <Link to="/register" className="switch-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}