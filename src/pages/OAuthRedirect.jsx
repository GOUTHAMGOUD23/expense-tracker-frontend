import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function OAuthRedirect() {
  console.log("OAuthRedirect loaded");
  const [params] = useSearchParams()
  const { loginWithOAuth } = useAuth()
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const token = params.get('token')
    const error = params.get('error')

    console.log("OAuth page loaded")
    console.log("Token:", token)

    if (error) {
      toast.error('Google login failed')
      return navigate('/login', { replace: true })
    }

    if (!token) {
      toast.error('No token received')
      return navigate('/login', { replace: true })
    }

    loginWithOAuth(token)
      .then((user) => {
        console.log("User:", user)
        toast.success('Login successful')
        navigate('/', { replace: true })
      })
      .catch((err) => {
        console.error(err)
        toast.error('Login failed')
        navigate('/login', { replace: true })
      })

  }, [])

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h3>Signing you in...</h3>
    </div>
  )
}