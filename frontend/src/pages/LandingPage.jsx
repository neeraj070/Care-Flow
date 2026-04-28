import { Link } from 'react-router-dom'
import {
  IconHeart, IconCalendar, IconStethoscope, IconPill, IconReceipt, IconShield,
  IconUser, IconActivity, IconArrowRight, IconClock, IconSparkle,
} from '../components/Icons.jsx'

const features = [
  { icon: <IconCalendar />, title: 'Online Appointments', text: 'Patients book slots with available doctors in seconds — no calls, no queues.' },
  { icon: <IconStethoscope />, title: 'Doctor Workspace', text: 'Manage availability, review patient history, and publish prescriptions in one place.' },
  { icon: <IconPill />, title: 'Digital Prescriptions', text: 'Prescriptions are delivered straight to the patient record with full traceability.' },
  { icon: <IconReceipt />, title: 'Smart Billing', text: 'Generate digital bills tied to each appointment and track payment status live.' },
  { icon: <IconShield />, title: 'Role-based Access', text: 'JWT-secured logins for patients, doctors, and admins keep data scoped to the right people.' },
  { icon: <IconActivity />, title: 'Live Dashboards', text: 'Admins monitor users, appointments, and revenue from a centralised control panel.' },
]

const steps = [
  { t: 'Sign up', d: 'Create a patient or doctor account in under a minute.' },
  { t: 'Book a slot', d: 'Pick a doctor, choose a date, and confirm the time.' },
  { t: 'Consult', d: 'Doctor reviews history and writes the prescription.' },
  { t: 'Get billed', d: 'Hospital staff generate the digital bill — pay and done.' },
]

function LandingPage() {
  return (
    <div className="landing">
      {/* Nav */}
      <header className="nav">
        <Link to="/" className="nav-brand">
          <span className="logo"><IconHeart width={18} height={18} /></span>
          CareFlow HMS
        </Link>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#roles">For You</a>
          <a href="#workflow">Workflow</a>
        </nav>
        <div className="nav-actions">
          <Link to="/login" className="button button-ghost button-sm">Sign in</Link>
          <Link to="/signup" className="button button-sm">
            Get started <IconArrowRight width={14} height={14} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-grid">
          <div className="fade-up">
            <span className="hero-kicker">
              <span className="dot" /> Hospital management, reimagined
            </span>
            <h1>
              Modern hospital operations,<br />
              <span className="accent">simple for everyone.</span>
            </h1>
            <p className="lead">
              CareFlow brings appointments, patient records, prescriptions and billing into one
              calm, secure workspace — built for patients, doctors and administrators.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="button">
                Create free account <IconArrowRight width={16} height={16} />
              </Link>
              <Link to="/login" className="button button-soft">Patient / Doctor login</Link>
              <Link to="/admin-login" className="button button-soft">
                <IconShield width={14} height={14} /> Admin
              </Link>
            </div>
            <div className="hero-meta">
              <div><span>3</span><span>roles supported</span></div>
              <div><span>JWT</span><span>secure auth</span></div>
              <div><span>24/7</span><span>cloud access</span></div>
            </div>
          </div>

          {/* Hero glass card */}
          <div className="hero-card fade-up delay-2">
            <div className="hero-card-head">
              <div className="avatar">RA</div>
              <div>
                <h4>Ravi A.</h4>
                <p>Patient · ID #00428</p>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--ink-500)', fontSize: '.78rem', display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
                <IconClock width={14} height={14} /> Today
              </span>
            </div>
            <div className="hero-card-body">
              <div className="hero-row">
                <span><strong>Cardiology</strong> · Dr. Patel</span>
                <span className="pill ok">Confirmed</span>
              </div>
              <div className="hero-row">
                <span><strong>Prescription</strong> · Atorvastatin 20mg</span>
                <span className="pill">Today</span>
              </div>
              <div className="hero-row">
                <span><strong>Bill</strong> · ₹ 1,250</span>
                <span className="pill warn">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-head">
          <span className="eyebrow">Features</span>
          <h2>Everything a modern hospital needs</h2>
          <p>From the front desk to the billing counter, CareFlow streamlines every interaction with a clean, role-aware interface.</p>
        </div>
        <div className="features">
          {features.map((f, i) => (
            <article key={f.title} className={`feature fade-up delay-${(i % 4) + 1}`}>
              <div className="feature-ico">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="section" id="roles" style={{ background: 'linear-gradient(180deg, transparent, #eff8fb 60%)' }}>
        <div className="section-head">
          <span className="eyebrow">Built for every role</span>
          <h2>One platform, three tailored experiences</h2>
          <p>Each user gets a focused workspace with the actions and data that actually matter to them.</p>
        </div>
        <div className="roles">
          <article className="role">
            <div className="role-ico"><IconUser /></div>
            <h3>Patients</h3>
            <ul>
              <li>Book appointments online</li>
              <li>Track medical history</li>
              <li>View prescriptions & bills</li>
            </ul>
            <Link to="/signup" className="button button-soft">Register as patient</Link>
          </article>
          <article className="role">
            <div className="role-ico"><IconStethoscope /></div>
            <h3>Doctors</h3>
            <ul>
              <li>Set weekly availability</li>
              <li>Review patient records</li>
              <li>Publish prescriptions</li>
            </ul>
            <Link to="/signup" className="button button-soft">Register as doctor</Link>
          </article>
          <article className="role">
            <div className="role-ico"><IconShield /></div>
            <h3>Admins</h3>
            <ul>
              <li>Monitor hospital activity</li>
              <li>Generate digital bills</li>
              <li>Manage doctors & patients</li>
            </ul>
            <Link to="/admin-login" className="button button-soft">Admin login</Link>
          </article>
        </div>
      </section>

      {/* Workflow */}
      <section className="section" id="workflow">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>From booking to billing in four steps</h2>
          <p>A predictable patient journey — captured at every stage by the system.</p>
        </div>
        <div className="workflow">
          {steps.map((s, i) => (
            <article key={s.t} className={`step fade-up delay-${i + 1}`}>
              <div className="num">{i + 1}</div>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="cta-strip">
          <div>
            <h2>Run your hospital digitally — start today.</h2>
            <p>Spin up patient, doctor and admin workflows in minutes. No setup overhead.</p>
          </div>
          <div className="actions">
            <Link to="/signup" className="button button-soft">
              <IconSparkle width={16} height={16} /> Start free
            </Link>
            <Link to="/login" className="button button-soft">Sign in</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} CareFlow HMS · Hospital Management System · Built with React, Express & MongoDB
      </footer>
    </div>
  )
}

export default LandingPage
