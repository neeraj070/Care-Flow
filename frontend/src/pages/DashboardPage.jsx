import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import apiClient from '../api/client.js'
import { useAuth } from '../context/auth-context.js'
import {
  IconHeart, IconLayout, IconCalendar, IconStethoscope, IconPill, IconReceipt,
  IconUser, IconUsers, IconActivity, IconShield, IconLogout, IconPlus, IconCheck, IconX, IconClock,
} from '../components/Icons.jsx'

const RAZORPAY_KEY_ID_FALLBACK = 'rzp_test_1DP5mmOlF5G5ag'

const toPrettyDate = (value) => (value ? new Date(value).toLocaleString() : '—')
const toShortDate = (value) => (value ? new Date(value).toLocaleDateString() : '—')
const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('') || 'U'
const todayStr = () => new Date().toISOString().slice(0, 10)
const nowTimeStr = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function StatCard({ label, value, icon, tone = '' }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="ico">{icon}</div>
      <div>
        <p className="k">{label}</p>
        <p className="v">{value}</p>
      </div>
    </article>
  )
}

function Panel({ title, icon, children, action }) {
  return (
    <section className="panel fade-up">
      <h3>
        {icon ? <span className="ico">{icon}</span> : null}
        <span style={{ flex: 1 }}>{title}</span>
        {action}
      </h3>
      {children}
    </section>
  )
}

function TableCard({ title, count, children }) {
  return (
    <div className="table-wrap fade-up">
      <div className="table-head">
        <h3>{title}</h3>
        {typeof count === 'number' ? <span className="count">{count} record{count === 1 ? '' : 's'}</span> : null}
      </div>
      {children}
    </div>
  )
}

function StatusBadge({ status }) {
  if (!status) return <span className="badge">—</span>
  return <span className={`badge ${String(status).toLowerCase()}`}>{status}</span>
}
function EmptyRow({ cols, label }) {
  return <tr><td className="empty" colSpan={cols}>{label}</td></tr>
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

/* ============================================================
   PATIENT PANEL
   ============================================================ */
function PatientPanel({ section, setSection, user }) {
  const [profile, setProfile] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [bills, setBills] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [booking, setBooking] = useState(false)
  const [bookForm, setBookForm] = useState({
    specialization: '', doctorId: '', appointmentDate: '', appointmentTime: '',
  })
  const [profileForm, setProfileForm] = useState({
    age: '', gender: '', phone: '', address: '', bloodGroup: '', historyText: '',
  })

  const refresh = async () => {
    try {
      // Try fetching specializations — fall back gracefully if endpoint missing
      const baseRequests = [
        apiClient.get('/patients/me'),
        apiClient.get('/doctors'),
        apiClient.get('/appointments'),
        apiClient.get('/prescriptions'),
        apiClient.get('/billing'),
      ]
      const [profileRes, doctorsRes, appointmentsRes, prescriptionsRes, billsRes] =
        await Promise.all(baseRequests)

      const p = profileRes.data.patient
      setProfile(p)
      const fetchedDoctors = doctorsRes.data.doctors
      setDoctors(fetchedDoctors)

      // Derive specializations from doctors list as fallback
      const specs = [...new Set(fetchedDoctors.map((d) => d.specialization).filter(Boolean))].sort()
      setSpecializations(specs)

      setAppointments(appointmentsRes.data.appointments)
      setPrescriptions(prescriptionsRes.data.prescriptions)
      setBills(billsRes.data.bills)
      setProfileForm({
        age: p.age || '',
        gender: p.gender || '',
        phone: p.phone || '',
        address: p.address || '',
        bloodGroup: p.bloodGroup || '',
        historyText: (p.medicalHistory || []).join(', '),
      })

      // Also try dedicated specializations endpoint — update if available
      try {
        const specsRes = await apiClient.get('/doctors/specializations')
        if (specsRes.data.specializations?.length) {
          setSpecializations(specsRes.data.specializations)
        }
      } catch (_) {
        // endpoint optional — already derived from doctors above
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient data.')
    }
  }

  useEffect(() => { refresh() }, []) // eslint-disable-line

  const filteredDoctors = useMemo(
    () => (bookForm.specialization
      ? doctors.filter((d) => d.specialization === bookForm.specialization)
      : doctors),
    [doctors, bookForm.specialization]
  )

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d._id === bookForm.doctorId),
    [doctors, bookForm.doctorId]
  )

  const minTime = useMemo(() => {
    if (bookForm.appointmentDate === todayStr()) return nowTimeStr()
    return undefined
  }, [bookForm.appointmentDate])

  const onBookSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate fields
    if (!bookForm.doctorId) { setError('Please select a doctor.'); return }
    if (!bookForm.appointmentDate) { setError('Please select a date.'); return }
    if (!bookForm.appointmentTime) { setError('Please select a time.'); return }

    const dt = new Date(`${bookForm.appointmentDate}T${bookForm.appointmentTime}`)
    if (Number.isNaN(dt.getTime())) {
      setError('Invalid date or time. Please check your selection.')
      return
    }
    // Give a 2-minute grace window instead of strict future check
    if (dt.getTime() < Date.now() - 2 * 60 * 1000) {
      setError('Please choose a future date and time.')
      return
    }

    setBooking(true)
    try {
      const res = await apiClient.post('/appointments', {
        doctorId: bookForm.doctorId,
        appointmentDate: dt.toISOString(),
      })
      setBookForm({ specialization: '', doctorId: '', appointmentDate: '', appointmentTime: '' })
      const billMsg = res.data.bill?.amount
        ? ` A bill of ₹${res.data.bill.amount} has been generated — please complete payment.`
        : ''
      setSuccess(`Appointment booked successfully.${billMsg}`)
      await refresh()
      if (billMsg) setSection('billing')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to book appointment. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  const onProfileSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    const medicalHistory = profileForm.historyText.split(',').map((s) => s.trim()).filter(Boolean)
    try {
      await apiClient.put('/patients/me', {
        age: profileForm.age ? Number(profileForm.age) : null,
        gender: profileForm.gender,
        phone: profileForm.phone,
        address: profileForm.address,
        bloodGroup: profileForm.bloodGroup,
        medicalHistory,
      })
      setSuccess('Profile saved successfully.')
      refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile.')
    }
  }

  const setBillMethod = async (id, method) => {
    setError(''); setSuccess('')
    try {
      await apiClient.put(`/billing/${id}/method`, { paymentMethod: method })
      setSuccess(method === 'offline' ? 'Marked as Pay at Hospital.' : 'Online payment selected.')
      refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update payment method.')
    }
  }

  // REPLACE only the payOnline function inside PatientPanel.
// Everything else in your DashboardPage stays exactly the same.
// Find your existing payOnline function and replace it with this:

  const payOnline = async (bill) => {
    setError('')
    setSuccess('')

    // Step 1: Load the Razorpay checkout script
    const ok = await loadRazorpay()
    if (!ok) {
      setError('Failed to load Razorpay SDK. Check your internet connection.')
      return
    }

    let order
    try {
      // Step 2: Ask backend to create a Razorpay order
      // Backend returns: { orderId, keyId, amount (paise), currency, billId }
      const { data } = await apiClient.post(`/billing/${bill._id}/razorpay-order`)
      order = data
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create payment order. Please try again.')
      return
    }

    // Step 3: Open Razorpay checkout
    const options = {
      key: order.keyId,                   // rzp_test_XXXX or rzp_live_XXXX from backend
      amount: order.amount,               // in paise — Razorpay requires this
      currency: order.currency || 'INR',
      name: 'CareFlow Hospital',
      description: 'Consultation fee',
      order_id: order.orderId,            // MUST match the key your backend returns (orderId)
      prefill: {
        name: user?.username || '',
        email: user?.email || '',
      },
      theme: { color: '#0ea5b7' },

      // Step 4: On successful payment, verify with backend
      handler: async (response) => {
        // response contains: razorpay_order_id, razorpay_payment_id, razorpay_signature
        try {
          await apiClient.post(`/billing/${bill._id}/razorpay-verify`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          setSuccess('Payment successful — bill marked as paid.')
          refresh()
        } catch (err) {
          // Payment went through on Razorpay side but verification failed
          // This is serious — tell user to contact support
          setError(
            err.response?.data?.message ||
            'Payment captured but verification failed. Please contact support with your payment ID: ' +
            response.razorpay_payment_id
          )
        }
      },

      // Step 5: Handle modal close without payment
      modal: {
        ondismiss: () => {
          setError('Payment cancelled. You can try again anytime.')
        },
      },
    }

    const rzp = new window.Razorpay(options)

    // Handle payment failures (card declined, bank error, etc.)
    rzp.on('payment.failed', (response) => {
      setError(
        `Payment failed: ${response.error.description || 'Unknown error'} ` +
        `(Code: ${response.error.code}). Please try a different payment method.`
      )
    })

    rzp.open()
  }
  
  const doctorsBySpec = useMemo(() => {
    const map = new Map()
    doctors.forEach((d) => {
      const k = d.specialization || 'General'
      if (!map.has(k)) map.set(k, [])
      map.get(k).push(d)
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [doctors])

  return (
    <>
      <div className="content-header">
        <div>
          <h2>Patient Portal</h2>
          <p>Book appointments, view your records and manage billing.</p>
        </div>
      </div>

      {error ? <p className="error">⚠ {error}</p> : null}
      {success ? <p className="success">✓ {success}</p> : null}

      {section === 'overview' && (
        <>
          <div className="stats">
            <StatCard tone="" label="Available Doctors" value={doctors.length} icon={<IconStethoscope />} />
            <StatCard tone="indigo" label="My Appointments" value={appointments.length} icon={<IconCalendar />} />
            <StatCard tone="green" label="Prescriptions" value={prescriptions.length} icon={<IconPill />} />
            <StatCard tone="amber" label="Bills" value={bills.length} icon={<IconReceipt />} />
          </div>

          <Panel title="Browse doctors by specialization" icon={<IconStethoscope width={16} height={16} />}>
            {doctorsBySpec.length === 0 ? (
              <p className="muted">No doctors available right now.</p>
            ) : (
              doctorsBySpec.map(([spec, list]) => (
                <div key={spec} style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 .5rem', fontSize: '.95rem', color: 'var(--text-2, #475569)' }}>
                    {spec} <span className="badge">{list.length}</span>
                  </h4>
                  <div className="doctor-grid">
                    {list.map((d) => (
                      <article key={d._id} className="doctor-card">
                        <div className="avatar">{initials(d.userId?.username)}</div>
                        <div>
                          <div className="name">Dr. {d.userId?.username || '—'}</div>
                          <div className="spec">{d.specialization} · ₹{d.consultationFee || 0}</div>
                          <div className="muted" style={{ fontSize: '.78rem', marginTop: 2 }}>
                            {d.availability?.length
                              ? `${d.availability.length} slot${d.availability.length === 1 ? '' : 's'} configured`
                              : 'No slots yet'}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))
            )}
          </Panel>
        </>
      )}

      {section === 'profile' && (
        <Panel title="My profile" icon={<IconUser width={16} height={16} />}>
          <div style={{ marginBottom: '1rem' }}>
            <p className="muted" style={{ margin: 0 }}>Signed in as</p>
            <h3 style={{ margin: '.2rem 0 0' }}>{user?.username}</h3>
            <p className="muted" style={{ margin: 0 }}>{user?.email}</p>
          </div>
          <form className="form-grid" onSubmit={onProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '.7rem' }}>
              <div className="field">
                <label>Age</label>
                <input className="input" type="number" min="0" max="120" value={profileForm.age}
                  onChange={(e) => setProfileForm((p) => ({ ...p, age: e.target.value }))} />
              </div>
              <div className="field">
                <label>Gender</label>
                <select className="select" value={profileForm.gender}
                  onChange={(e) => setProfileForm((p) => ({ ...p, gender: e.target.value }))}>
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="field">
                <label>Blood group</label>
                <input className="input" value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm((p) => ({ ...p, bloodGroup: e.target.value }))}
                  placeholder="e.g. O+" />
              </div>
              <div className="field">
                <label>Phone</label>
                <input className="input" value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label>Address</label>
              <input className="input" value={profileForm.address}
                onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))} />
            </div>
            <div className="field">
              <label>Medical history (comma separated)</label>
              <textarea className="textarea" value={profileForm.historyText}
                onChange={(e) => setProfileForm((p) => ({ ...p, historyText: e.target.value }))}
                placeholder="e.g. Diabetes, Penicillin allergy" />
            </div>
            <button className="button" type="submit"><IconCheck width={14} height={14} /> Save profile</button>
          </form>
        </Panel>
      )}

      {section === 'book' && (
        <Panel title="Book appointment" icon={<IconCalendar width={16} height={16} />}>
          <form className="form-grid" onSubmit={onBookSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
              <div className="field">
                <label>Specialization <span className="muted" style={{fontWeight:400}}>(optional filter)</span></label>
                <select className="select" value={bookForm.specialization}
                  onChange={(e) => setBookForm((p) => ({ ...p, specialization: e.target.value, doctorId: '' }))}>
                  <option value="">All specializations</option>
                  {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Doctor <span style={{color:'red'}}>*</span></label>
                <select className="select" value={bookForm.doctorId}
                  onChange={(e) => setBookForm((p) => ({ ...p, doctorId: e.target.value }))}
                  required>
                  <option value="">Select a doctor</option>
                  {filteredDoctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.userId?.username} — ₹{d.consultationFee || 0}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedDoctor && (
              <div className="muted" style={{ fontSize: '.85rem', padding: '.6rem .8rem', background: 'var(--surface-2,#f1f5f9)', borderRadius: 8 }}>
                Fee: <strong>₹{selectedDoctor.consultationFee || 0}</strong>
                {selectedDoctor.availability?.length ? (
                  <span> · Slots: {selectedDoctor.availability.map((s, i) => (
                    <span key={i} className="badge" style={{ marginRight: 4 }}>
                      {s.day} {s.startTime}–{s.endTime}
                    </span>
                  ))}</span>
                ) : (
                  <span style={{ color: '#f59e0b' }}> · No slots configured yet — you can still book.</span>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem' }}>
              <div className="field">
                <label>Date <span style={{color:'red'}}>*</span></label>
                <input className="input" type="date" min={todayStr()}
                  value={bookForm.appointmentDate}
                  onChange={(e) => setBookForm((p) => ({ ...p, appointmentDate: e.target.value }))} required />
              </div>
              <div className="field">
                <label>Time <span style={{color:'red'}}>*</span></label>
                <input className="input" type="time" min={minTime}
                  value={bookForm.appointmentTime}
                  onChange={(e) => setBookForm((p) => ({ ...p, appointmentTime: e.target.value }))} required />
              </div>
            </div>

            {/* Button is ALWAYS enabled as long as required fields are filled */}
            <button
              className="button"
              type="submit"
              disabled={booking || !bookForm.doctorId || !bookForm.appointmentDate || !bookForm.appointmentTime}
              style={{ opacity: (booking || !bookForm.doctorId || !bookForm.appointmentDate || !bookForm.appointmentTime) ? 0.6 : 1 }}
            >
              {booking
                ? '⏳ Booking…'
                : <><IconPlus width={14} height={14} /> Book appointment</>}
            </button>
          </form>
        </Panel>
      )}

      {section === 'appointments' && (
        <TableCard title="My appointments" count={appointments.length}>
          <table className="table">
            <thead><tr><th>Date</th><th>Doctor</th><th>Status</th></tr></thead>
            <tbody>
              {appointments.length === 0 ? <EmptyRow cols={3} label="No appointments yet — book one from the Book tab." /> :
                appointments.map((item) => (
                  <tr key={item._id}>
                    <td>{toPrettyDate(item.appointmentDate)}</td>
                    <td>Dr. {item.doctorId?.userId?.username || '—'}</td>
                    <td><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableCard>
      )}

      {section === 'records' && (
        <TableCard title="Prescriptions" count={prescriptions.length}>
          <table className="table">
            <thead><tr><th>Date</th><th>Doctor</th><th>Medicines</th><th>Notes</th></tr></thead>
            <tbody>
              {prescriptions.length === 0 ? <EmptyRow cols={4} label="No prescriptions yet." /> :
                prescriptions.map((item) => (
                  <tr key={item._id}>
                    <td>{toPrettyDate(item.createdAt)}</td>
                    <td>Dr. {item.doctorId?.userId?.username || '—'}</td>
                    <td>{(item.medicines || []).join(', ') || '—'}</td>
                    <td>{item.notes || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableCard>
      )}

      {section === 'billing' && (
        <TableCard title="Bills" count={bills.length}>
          <table className="table">
            <thead>
              <tr>
                <th>Amount</th><th>Status</th><th>Method</th>
                <th>Generated</th><th>Paid</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? <EmptyRow cols={6} label="No bills yet." /> :
                bills.map((item) => (
                  <tr key={item._id}>
                    <td><strong>₹ {item.amount}</strong></td>
                    <td><StatusBadge status={item.paymentStatus} /></td>
                    <td>
                      {item.paymentMethod === 'unset'
                        ? <span className="muted">choose →</span>
                        : <span className="badge">{item.paymentMethod}</span>}
                    </td>
                    <td>{toShortDate(item.createdAt)}</td>
                    <td>{item.paidAt ? toShortDate(item.paidAt) : '—'}</td>
                    <td>
                      {item.paymentStatus === 'paid' ? (
                        <span className="badge paid">Paid</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <select className="select" style={{ minWidth: 150 }}
                            value={item.paymentMethod === 'unset' ? '' : item.paymentMethod}
                            onChange={(e) => setBillMethod(item._id, e.target.value)}>
                            <option value="" disabled>Select method</option>
                            <option value="online">Pay Online</option>
                            <option value="offline">Pay at Hospital</option>
                          </select>
                          {item.paymentMethod === 'online' && (
                            <button className="button button-sm button-success" onClick={() => payOnline(item)}>
                              <IconReceipt width={13} height={13} /> Pay ₹{item.amount}
                            </button>
                          )}
                          {item.paymentMethod === 'offline' && (
                            <span className="muted" style={{ fontSize: '.78rem' }}>Pay during consultation</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableCard>
      )}
    </>
  )
}

/* ============================================================
   DOCTOR PANEL
   ============================================================ */
function DoctorPanel({ section, user }) {
  const [doctorMe, setDoctorMe] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [bills, setBills] = useState([])
  const [patients, setPatients] = useState([])
  const [availability, setAvailability] = useState([{ day: '', startTime: '', endTime: '' }])
  const [fee, setFee] = useState(500)
  const [profileForm, setProfileForm] = useState({ specialization: '', bio: '', phone: '' })
  const [prescriptionForm, setPrescriptionForm] = useState({ patientId: '', medicines: '', notes: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const refresh = async () => {
    try {
      const [appointmentsRes, prescriptionsRes, patientsRes, doctorRes, billsRes] = await Promise.all([
        apiClient.get('/appointments'),
        apiClient.get('/prescriptions'),
        apiClient.get('/doctors/patients'),
        apiClient.get('/doctors/me'),
        apiClient.get('/billing'),
      ])
      setAppointments(appointmentsRes.data.appointments)
      setPrescriptions(prescriptionsRes.data.prescriptions)
      setPatients(patientsRes.data.users)
      setBills(billsRes.data.bills)
      const d = doctorRes.data.doctor
      setDoctorMe(d)
      const slots = d?.availability || []
      setAvailability(slots.length ? slots : [{ day: '', startTime: '', endTime: '' }])
      setFee(d?.consultationFee ?? 500)
      setProfileForm({
        specialization: d?.specialization || '',
        bio: d?.bio || '',
        phone: d?.phone || '',
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doctor data.')
    }
  }
  useEffect(() => { refresh() }, []) // eslint-disable-line

  const saveAvailability = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    const payload = availability.filter((s) => s.day && s.startTime && s.endTime && s.startTime < s.endTime)
    if (!payload.length) { setError('Please add at least one valid slot.'); return }
    if (Number(fee) < 0 || Number.isNaN(Number(fee))) { setError('Please enter a valid fee.'); return }
    try {
      await apiClient.put('/doctors/availability', { availability: payload, consultationFee: Number(fee) })
      setSuccess('Availability and fee saved.')
      refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save availability.')
    }
  }

  const saveProfile = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    try {
      await apiClient.put('/doctors/me', profileForm)
      setSuccess('Profile saved.')
      refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save profile.')
    }
  }

  const addAvailabilityRow = () =>
    setAvailability((p) => [...p, { day: '', startTime: '', endTime: '' }])
  const removeAvailabilityRow = (idx) =>
    setAvailability((p) => p.filter((_, i) => i !== idx))
  const updateAvailabilityRow = (idx, key, value) =>
    setAvailability((p) => p.map((row, i) => (i === idx ? { ...row, [key]: value } : row)))

  const updateStatus = async (id, status) => {
    setError(''); setSuccess('')
    try {
      await apiClient.put(`/appointments/${id}/status`, { status })
      setSuccess(`Appointment marked as ${status}.`)
      refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update appointment.')
    }
  }

  const markBillPaid = async (id) => {
    setError(''); setSuccess('')
    try {
      await apiClient.put(`/billing/${id}/status`, { paymentStatus: 'paid' })
      setSuccess('Bill marked as paid.')
      refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to mark bill paid.')
    }
  }

  const createPrescription = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    try {
      const medicines = prescriptionForm.medicines.split(',').map((s) => s.trim()).filter(Boolean)
      await apiClient.post('/prescriptions', {
        patientId: prescriptionForm.patientId,
        medicines,
        notes: prescriptionForm.notes,
      })
      setPrescriptionForm({ patientId: '', medicines: '', notes: '' })
      setSuccess('Prescription added.')
      refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add prescription.')
    }
  }

  const apptPatients = useMemo(() => {
    const seen = new Set()
    return appointments
      .map((a) => a.patientId)
      .filter((p) => p && !seen.has(String(p._id)) && seen.add(String(p._id)))
  }, [appointments])

  return (
    <>
      <div className="content-header">
        <div>
          <h2>Doctor Portal</h2>
          <p>Update your availability, manage appointments, and prescribe.</p>
        </div>
      </div>

      {error ? <p className="error">⚠ {error}</p> : null}
      {success ? <p className="success">✓ {success}</p> : null}

      {section === 'overview' && (
        <>
          <div className="stats">
            <StatCard tone="" label="Appointments" value={appointments.length} icon={<IconCalendar />} />
            <StatCard tone="indigo" label="Patients seen" value={apptPatients.length} icon={<IconUsers />} />
            <StatCard tone="green" label="Prescriptions" value={prescriptions.length} icon={<IconPill />} />
            <StatCard tone="amber" label="Bills" value={bills.length} icon={<IconReceipt />} />
          </div>
          <TableCard title="Recent appointments" count={appointments.length}>
            <table className="table">
              <thead><tr><th>Date</th><th>Patient</th><th>Status</th></tr></thead>
              <tbody>
                {appointments.length === 0 ? <EmptyRow cols={3} label="No appointments yet." /> :
                  appointments.slice(0, 5).map((a) => (
                    <tr key={a._id}>
                      <td>{toPrettyDate(a.appointmentDate)}</td>
                      <td>{a.patientId?.userId?.username || '—'}</td>
                      <td><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </TableCard>
        </>
      )}

      {section === 'profile' && (
        <Panel title="My profile" icon={<IconStethoscope width={16} height={16} />}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: '.2rem 0 0' }}>Dr. {user?.username}</h3>
            <p className="muted" style={{ margin: 0 }}>{user?.email}</p>
            <p className="muted" style={{ margin: '.4rem 0 0' }}>
              Current fee: <strong>₹{doctorMe?.consultationFee || 0}</strong> ·
              {' '}{doctorMe?.availability?.length || 0} availability slot(s)
            </p>
          </div>
          <form className="form-grid" onSubmit={saveProfile}>
            <div className="field">
              <label>Specialization</label>
              <input className="input" value={profileForm.specialization}
                onChange={(e) => setProfileForm((p) => ({ ...p, specialization: e.target.value }))} required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input className="input" value={profileForm.phone}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="field">
              <label>Bio</label>
              <textarea className="textarea" value={profileForm.bio}
                onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="A short description of your practice…" />
            </div>
            <button className="button" type="submit"><IconCheck width={14} height={14} /> Save profile</button>
          </form>
        </Panel>
      )}

      {section === 'schedule' && (
        <Panel title="Availability & fee" icon={<IconClock width={16} height={16} />}
          action={
            <button type="button" className="button button-ghost button-sm" onClick={addAvailabilityRow}>
              <IconPlus width={14} height={14} /> Add slot
            </button>
          }>
          <form className="form-grid" onSubmit={saveAvailability}>
            <div className="field">
              <label>Consultation fee (₹)</label>
              <input className="input" type="number" min="0" step="50" value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="e.g. 500" required />
            </div>
            {availability.map((slot, index) => (
              <div className="slot-row" key={index}>
                <div className="field">
                  <label>Date</label>
                  <input className="input" type="date" min={todayStr()} value={slot.day}
                    onChange={(e) => updateAvailabilityRow(index, 'day', e.target.value)} />
                </div>
                <div className="field">
                  <label>Start</label>
                  <input className="input" type="time" value={slot.startTime}
                    onChange={(e) => updateAvailabilityRow(index, 'startTime', e.target.value)} />
                </div>
                <div className="field">
                  <label>End</label>
                  <input className="input" type="time" value={slot.endTime}
                    onChange={(e) => updateAvailabilityRow(index, 'endTime', e.target.value)} />
                </div>
                <button type="button" className="slot-remove"
                  onClick={() => removeAvailabilityRow(index)}
                  disabled={availability.length === 1}>
                  <IconX width={14} height={14} />
                </button>
              </div>
            ))}
            <button className="button" type="submit"><IconCheck width={14} height={14} /> Save availability & fee</button>
          </form>
        </Panel>
      )}

      {section === 'appointments' && (
        <TableCard title="Appointments" count={appointments.length}>
          <table className="table">
            <thead><tr><th>Date</th><th>Patient</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {appointments.length === 0 ? <EmptyRow cols={4} label="No appointments yet." /> :
                appointments.map((item) => (
                  <tr key={item._id}>
                    <td>{toPrettyDate(item.appointmentDate)}</td>
                    <td>{item.patientId?.userId?.username || '—'}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <div className="actions-cell">
                        {item.status === 'booked' && (
                          <button className="button button-sm button-warn"
                            onClick={() => updateStatus(item._id, 'confirmed')}>
                            <IconCheck width={13} height={13} /> Confirm
                          </button>
                        )}
                        {item.status === 'confirmed' && (
                          <button className="button button-sm button-success"
                            onClick={() => updateStatus(item._id, 'completed')}>
                            <IconCheck width={13} height={13} /> Complete
                          </button>
                        )}
                        {(item.status === 'completed' || item.status === 'cancelled') && (
                          <span className="muted" style={{ fontSize: '.82rem' }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableCard>
      )}

      {section === 'records' && (
        <Panel title="Add prescription" icon={<IconPill width={16} height={16} />}>
          <form className="form-grid" onSubmit={createPrescription}>
            <div className="field">
              <label>Patient</label>
              <select className="select" value={prescriptionForm.patientId}
                onChange={(e) => setPrescriptionForm((p) => ({ ...p, patientId: e.target.value }))} required>
                <option value="">Select a patient</option>
                {apptPatients.map((p) => (
                  <option key={p._id} value={p._id}>{p.userId?.username || '—'}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Medicines (comma separated)</label>
              <input className="input" value={prescriptionForm.medicines}
                onChange={(e) => setPrescriptionForm((p) => ({ ...p, medicines: e.target.value }))}
                placeholder="e.g. Paracetamol 500mg, Vitamin D3" required />
            </div>
            <div className="field">
              <label>Notes</label>
              <textarea className="textarea" value={prescriptionForm.notes}
                onChange={(e) => setPrescriptionForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Dosage, follow-up instructions, observations…" />
            </div>
            <button className="button" type="submit"><IconPlus width={14} height={14} /> Publish prescription</button>
          </form>
        </Panel>
      )}

      {section === 'billing' && (
        <TableCard title="Bills for my patients" count={bills.length}>
          <table className="table">
            <thead>
              <tr><th>Patient</th><th>Amount</th><th>Method</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {bills.length === 0 ? <EmptyRow cols={5} label="No bills yet." /> :
                bills.map((b) => (
                  <tr key={b._id}>
                    <td>{b.patientId?.userId?.username || '—'}</td>
                    <td><strong>₹ {b.amount}</strong></td>
                    <td><span className="badge">{b.paymentMethod}</span></td>
                    <td><StatusBadge status={b.paymentStatus} /></td>
                    <td>
                      {b.paymentStatus === 'pending' && b.paymentMethod === 'offline' ? (
                        <button className="button button-sm button-success" onClick={() => markBillPaid(b._id)}>
                          <IconCheck width={13} height={13} /> Mark paid (cash)
                        </button>
                      ) : <span className="muted" style={{ fontSize: '.8rem' }}>—</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableCard>
      )}
    </>
  )
}

/* ============================================================
   ADMIN PANEL
   ============================================================ */
function AdminPanel({ section }) {
  const [stats, setStats] = useState({})
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [bills, setBills] = useState([])
  const [billForm, setBillForm] = useState({ appointmentId: '', amount: '', paymentStatus: 'pending' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const refresh = async () => {
    try {
      const [dashboardRes, doctorsRes, patientsRes, appointmentsRes, billsRes] = await Promise.all([
        apiClient.get('/admin/dashboard'),
        apiClient.get('/doctors'),
        apiClient.get('/patients'),
        apiClient.get('/appointments'),
        apiClient.get('/billing'),
      ])
      setStats(dashboardRes.data.stats)
      setDoctors(doctorsRes.data.doctors)
      setPatients(patientsRes.data.patients)
      setAppointments(appointmentsRes.data.appointments)
      setBills(billsRes.data.bills)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.')
    }
  }
  useEffect(() => { refresh() }, []) // eslint-disable-line

  const createBill = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    try {
      await apiClient.post('/billing', {
        appointmentId: billForm.appointmentId,
        amount: Number(billForm.amount),
        paymentStatus: billForm.paymentStatus,
      })
      setBillForm({ appointmentId: '', amount: '', paymentStatus: 'pending' })
      setSuccess('Bill generated.')
      refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create bill.')
    }
  }

  const updateBill = async (id, paymentStatus) => {
    setError(''); setSuccess('')
    try {
      await apiClient.put(`/billing/${id}/status`, { paymentStatus })
      setSuccess(`Bill marked as ${paymentStatus}.`)
      refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update bill status.')
    }
  }

  return (
    <>
      <div className="content-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Monitor users, appointments, prescriptions, and billing across the hospital.</p>
        </div>
      </div>
      {error ? <p className="error">⚠ {error}</p> : null}
      {success ? <p className="success">✓ {success}</p> : null}

      {section === 'overview' && (
        <>
          <div className="stats">
            <StatCard tone="" label="Total users" value={stats.totalUsers || 0} icon={<IconUsers />} />
            <StatCard tone="indigo" label="Patients" value={stats.totalPatients || 0} icon={<IconUser />} />
            <StatCard tone="green" label="Doctors" value={stats.totalDoctors || 0} icon={<IconStethoscope />} />
            <StatCard tone="" label="Appointments" value={stats.totalAppointments || 0} icon={<IconCalendar />} />
            <StatCard tone="amber" label="Bills" value={stats.totalBills || 0} icon={<IconReceipt />} />
            <StatCard tone="green" label="Paid" value={stats.paidBills || 0} icon={<IconActivity />} />
            <StatCard tone="amber" label="Pending" value={stats.pendingBills || 0} icon={<IconClock />} />
          </div>
        </>
      )}

      {section === 'billing' && (
        <>
          <Panel title="Generate bill" icon={<IconPlus width={16} height={16} />}>
            <form className="form-grid" onSubmit={createBill}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '.7rem' }}>
                <div className="field">
                  <label>Appointment</label>
                  <select className="select" value={billForm.appointmentId}
                    onChange={(e) => setBillForm((p) => ({ ...p, appointmentId: e.target.value }))} required>
                    <option value="">Select appointment</option>
                    {appointments.map((a) => (
                      <option key={a._id} value={a._id}>
                        {toPrettyDate(a.appointmentDate)} — {a.patientId?.userId?.username || '—'} · Dr. {a.doctorId?.userId?.username || '—'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Amount (₹)</label>
                  <input className="input" type="number" min="0" value={billForm.amount}
                    onChange={(e) => setBillForm((p) => ({ ...p, amount: e.target.value }))} required />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="select" value={billForm.paymentStatus}
                    onChange={(e) => setBillForm((p) => ({ ...p, paymentStatus: e.target.value }))}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
              <button className="button" type="submit"><IconPlus width={14} height={14} /> Create bill</button>
            </form>
          </Panel>

          <TableCard title="All bills" count={bills.length}>
            <table className="table">
              <thead>
                <tr>
                  <th>Amount</th><th>Status</th><th>Generated</th>
                  <th>Paid</th><th>Appointment</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? <EmptyRow cols={6} label="No bills yet." /> :
                  bills.map((item) => (
                    <tr key={item._id}>
                      <td><strong>₹ {item.amount}</strong></td>
                      <td><StatusBadge status={item.paymentStatus} /></td>
                      <td>{toShortDate(item.createdAt)}</td>
                      <td>{item.paidAt ? toShortDate(item.paidAt) : '—'}</td>
                      <td>{toShortDate(item.appointmentId?.appointmentDate)}</td>
                      <td>
                        {item.paymentStatus === 'pending' ? (
                          <button className="button button-sm button-success" onClick={() => updateBill(item._id, 'paid')}>
                            <IconCheck width={13} height={13} /> Mark paid
                          </button>
                        ) : (
                          <button className="button button-sm button-ghost" onClick={() => updateBill(item._id, 'pending')}>
                            Mark pending
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </TableCard>
        </>
      )}

      {section === 'doctors' && (
        <TableCard title="Doctors" count={doctors.length}>
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Specialization</th><th>Fee</th></tr></thead>
            <tbody>
              {doctors.length === 0 ? <EmptyRow cols={4} label="No doctors registered." /> :
                doctors.map((item) => (
                  <tr key={item._id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: '.75rem' }}>
                        {initials(item.userId?.username)}
                      </div>
                      Dr. {item.userId?.username}
                    </td>
                    <td>{item.userId?.email}</td>
                    <td><span className="badge">{item.specialization}</span></td>
                    <td>₹{item.consultationFee || 0}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableCard>
      )}

      {section === 'patients' && (
        <TableCard title="Patients" count={patients.length}>
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Medical history</th></tr></thead>
            <tbody>
              {patients.length === 0 ? <EmptyRow cols={3} label="No patients registered." /> :
                patients.map((item) => (
                  <tr key={item._id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: '.75rem' }}>
                        {initials(item.userId?.username)}
                      </div>
                      {item.userId?.username}
                    </td>
                    <td>{item.userId?.email}</td>
                    <td>{(item.medicalHistory || []).join(', ') || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableCard>
      )}

      {section === 'appointments' && (
        <TableCard title="All appointments" count={appointments.length}>
          <table className="table">
            <thead><tr><th>Date</th><th>Patient</th><th>Doctor</th><th>Status</th></tr></thead>
            <tbody>
              {appointments.length === 0 ? <EmptyRow cols={4} label="No appointments yet." /> :
                appointments.map((item) => (
                  <tr key={item._id}>
                    <td>{toPrettyDate(item.appointmentDate)}</td>
                    <td>{item.patientId?.userId?.username || '—'}</td>
                    <td>Dr. {item.doctorId?.userId?.username || '—'}</td>
                    <td><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableCard>
      )}
    </>
  )
}

/* ============================================================
   SHELL
   ============================================================ */
const navByRole = {
  patient: [
    { id: 'overview', label: 'Overview', icon: <IconLayout width={16} height={16} /> },
    { id: 'profile', label: 'My Profile', icon: <IconUser width={16} height={16} /> },
    { id: 'book', label: 'Book', icon: <IconCalendar width={16} height={16} /> },
    { id: 'appointments', label: 'Appointments', icon: <IconClock width={16} height={16} /> },
    { id: 'records', label: 'Records', icon: <IconPill width={16} height={16} /> },
    { id: 'billing', label: 'Billing', icon: <IconReceipt width={16} height={16} /> },
  ],
  doctor: [
    { id: 'overview', label: 'Overview', icon: <IconLayout width={16} height={16} /> },
    { id: 'profile', label: 'My Profile', icon: <IconUser width={16} height={16} /> },
    { id: 'schedule', label: 'Availability', icon: <IconClock width={16} height={16} /> },
    { id: 'appointments', label: 'Appointments', icon: <IconCalendar width={16} height={16} /> },
    { id: 'records', label: 'Prescribe', icon: <IconPill width={16} height={16} /> },
    { id: 'billing', label: 'Billing', icon: <IconReceipt width={16} height={16} /> },
  ],
  admin: [
    { id: 'overview', label: 'Overview', icon: <IconLayout width={16} height={16} /> },
    { id: 'billing', label: 'Billing', icon: <IconReceipt width={16} height={16} /> },
    { id: 'doctors', label: 'Doctors', icon: <IconStethoscope width={16} height={16} /> },
    { id: 'patients', label: 'Patients', icon: <IconUsers width={16} height={16} /> },
    { id: 'appointments', label: 'Appointments', icon: <IconCalendar width={16} height={16} /> },
  ],
}

function DashboardPage() {
  const { user, logout } = useAuth()
  const [section, setSection] = useState('overview')

  const items = (user && navByRole[user.role]) || []

  if (!user) return <Navigate to="/login" replace />

  const roleIcon =
    user.role === 'doctor' ? <IconStethoscope width={14} height={14} /> :
    user.role === 'admin' ? <IconShield width={14} height={14} /> :
    <IconUser width={14} height={14} />

  let panel = null
  if (user.role === 'patient') panel = <PatientPanel section={section} setSection={setSection} user={user} />
  else if (user.role === 'doctor') panel = <DoctorPanel section={section} user={user} />
  else if (user.role === 'admin') panel = <AdminPanel section={section} />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo"><IconHeart width={18} height={18} /></span>
          CareFlow HMS
        </div>
        <span className="role-chip">{roleIcon} {user.role}</span>
        <p className="greeting">
          Hello <strong style={{ color: '#fff' }}>{user.username}</strong>.
        </p>

        <ul className="nav-list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${section === item.id ? 'active' : ''}`}
                onClick={() => setSection(item.id)}
              >
                {item.icon} {item.label}
              </button>
            </li>
          ))}
        </ul>

        <button className="logout" onClick={logout}>
          <IconLogout width={15} height={15} /> Logout
        </button>
      </aside>

      <main className="content">{panel}</main>
    </div>
  )
}

export default DashboardPage