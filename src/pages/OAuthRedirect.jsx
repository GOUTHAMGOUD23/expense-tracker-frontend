import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function OAuthRedirect() {
  const [params]           = useSearchParams()
  const { loginWithOAuth } = useAuth()
  const navigate           = useNavigate()
  const handled            = useRef(false)
  const [status, setStatus] = useState('Signing you in with Google…')

  useEffect(() => {
    // React StrictMode mounts twice — guard against double execution
    if (handled.current) return
    handled.current = true

    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      toast.error('Google login failed. Please try again.')
      navigate('/login', { replace: true })
      return
    }

    if (!token) {
      toast.error('No token received. Please try again.')
      navigate('/login', { replace: true })
      return
    }

    setStatus('Loading your account…')

    loginWithOAuth(token)
      .then((userData) => {
        if (userData) {
          const firstName = userData.name?.split(' ')[0] || 'back'
          toast.success(`Welcome, ${firstName}!`)
          navigate('/', { replace: true })
        } else {
          // fetchMe failed — token may be invalid
          toast.error('Could not load your account. Please sign in again.')
          navigate('/login', { replace: true })
        }
      })
      .catch((err) => {
        console.error('OAuthRedirect error:', err)
        toast.error('Something went wrong. Please try again.')
        navigate('/login', { replace: true })
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="loader-full">
      <div className="spinner spinner-lg" />
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
        {status}
      </p>
    </div>
  )
}