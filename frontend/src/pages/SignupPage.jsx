import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../context/auth-context.js'

function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'patient',
    age: '', gender: '', specialization: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      }
      if (form.role === 'patient') {
        payload.age = form.age ? Number(form.age) : undefined
        payload.gender = form.gender
      }
      if (form.role === 'doctor') {
        payload.specialization = form.specialization || 'General'
      }
      await signup(payload)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join CareFlow as a patient or doctor."
      mode="signup"
      onSubmit={onSubmit}
      error={error}
      loading={loading}
    >
      {/* Role tabs */}
      <div className="field">
        <label>I am a</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
          {['patient', 'doctor'].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setForm((p) => ({ ...p, role: r }))}
              className={form.role === r ? 'button button-sm' : 'button button-ghost button-sm'}
              style={{ justifyContent: 'center' }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="username">Full name</label>
        <input id="username" className="input" name="username"
          value={form.username} onChange={onChange} placeholder="Jane Doe" required />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" className="input" name="email" type="email"
          value={form.email} onChange={onChange} placeholder="you@example.com" required />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" className="input" name="password" type="password"
          value={form.password} onChange={onChange} placeholder="At least 6 characters"
          required minLength={6} />
      </div>

      {form.role === 'patient' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
          <div className="field">
            <label htmlFor="age">Age</label>
            <input id="age" className="input" name="age" type="number"
              value={form.age} onChange={onChange} placeholder="30" />
          </div>
          <div className="field">
            <label htmlFor="gender">Gender</label>
            <select id="gender" className="select" name="gender" value={form.gender} onChange={onChange}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="field">
          <label htmlFor="specialization">Specialization</label>
          <input id="specialization" className="input" name="specialization"
            value={form.specialization} onChange={onChange}
            placeholder="Cardiology, Neurology, Pediatrics…" />
        </div>
      )}
    </AuthShell>
  )
}

export default SignupPage
