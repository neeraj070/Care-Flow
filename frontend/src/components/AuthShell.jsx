import { Link } from 'react-router-dom'
import { IconHeart, IconShield } from './Icons.jsx'

function AuthShell({ title, subtitle, mode, onSubmit, error, loading, children, footer }) {
  return (
    <div className="auth-screen">
      <aside className="auth-aside">
        <Link to="/" className="brand-mark">
          <span className="logo"><IconHeart width={18} height={18} /></span>
          CareFlow HMS
        </Link>

        <div>
          <h1>
            Care that flows,<br />
            <span className="accent">data that works.</span>
          </h1>
          <p className="sub">
            One secure platform for patients, doctors and administrators.
            Appointments, prescriptions and billing — all in sync.
          </p>
          <ul className="wave-list">
            <li>JWT-secured authentication with role-based access</li>
            <li>Real-time appointment & prescription updates</li>
            <li>Beautiful, focused dashboards for every role</li>
          </ul>
        </div>

        <p className="aside-foot">
          <IconShield width={13} height={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
          Your data is encrypted in transit and protected by JWT tokens.
        </p>
      </aside>

      <section className="auth-form">
        <div className="auth-card">
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>

          <form className="form-grid" onSubmit={onSubmit}>
            {error ? <p className="error">⚠ {error}</p> : null}
            {children}
            <button className="button" type="submit" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Please wait…</>
              ) : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {footer ? (
            <p className="muted" style={{ marginTop: '1rem' }}>{footer}</p>
          ) : (
            <p className="muted" style={{ marginTop: '1rem' }}>
              {mode === 'login' ? (
                <>New here? <Link className="link-action" to="/signup">Create an account</Link></>
              ) : (
                <>Already have an account? <Link className="link-action" to="/login">Sign in</Link></>
              )}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export default AuthShell
