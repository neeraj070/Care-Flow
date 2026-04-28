import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import apiClient from '../api/client.js'
import { useAuth } from '../context/auth-context.js'

function AdminLoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await apiClient.post('/auth/admin-login', form)
      setSession(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Admin access"
      subtitle="Restricted hospital administration portal."
      mode="login"
      onSubmit={onSubmit}
      error={error}
      loading={loading}
      footer={<>Not an admin? <Link className="link-action" to="/login">Use the patient / doctor login</Link></>}
    >
      <div className="field">
        <label htmlFor="email">Admin email</label>
        <input id="email" className="input" name="email" type="email"
          value={form.email} onChange={onChange} placeholder="admin@hospital.com" required />
      </div>
      <div className="field">
        <label htmlFor="password">Admin password</label>
        <input id="password" className="input" name="password" type="password"
          value={form.password} onChange={onChange} placeholder="••••••••" required />
      </div>
    </AuthShell>
  )
}

export default AdminLoginPage
