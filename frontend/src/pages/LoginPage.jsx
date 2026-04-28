import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../context/auth-context.js'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your patient or doctor account."
      mode="login"
      onSubmit={onSubmit}
      error={error}
      loading={loading}
      footer={
        <>
          New here?{' '}
          <Link className="link-action" to="/signup">Create an account</Link>{' '}
          · Admin?{' '}
          <Link className="link-action" to="/admin-login">Use admin portal</Link>
        </>
      }
    >
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" className="input" name="email" type="email"
          value={form.email} onChange={onChange} placeholder="you@example.com" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" className="input" name="password" type="password"
          value={form.password} onChange={onChange} placeholder="••••••••" required />
      </div>
    </AuthShell>
  )
}

export default LoginPage
