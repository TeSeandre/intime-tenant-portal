import { useEffect, useState } from 'react'
import NavLayout from '../shared/NavLayout'
import FileUpload from '../shared/FileUpload'
import { useAuth } from '../../hooks/useAuth'
import { useMaintenance } from '../../hooks/useMaintenance'
import { supabase } from '../../lib/supabase'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

const CATEGORIES = ['Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Structural', 'Pest', 'Other']
const PRIORITIES = ['Low', 'Medium', 'High', 'Emergency']

const selectStyle = {
  width: '100%', background: T.bgHover, border: `1px solid ${T.tanFaded}`,
  borderRadius: '8px', padding: '10px 12px', fontSize: '13px',
  color: T.tan, fontFamily: font, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 200ms ease', appearance: 'none',
}

const inputStyle = {
  width: '100%', background: T.bgHover, border: `1px solid ${T.tanFaded}`,
  borderRadius: '8px', padding: '10px 12px', fontSize: '13px',
  color: T.tan, fontFamily: font, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 200ms ease', resize: 'none',
}

function statusToStep(status) {
  if (status === 'open') return 0
  if (status === 'in_progress') return 1
  if (status === 'resolved' || status === 'closed') return 3
  return 0
}

function MaintenanceTracker({ ticket }) {
  const activeStep = statusToStep(ticket.status)
  const steps = [
    { label: 'Submitted', icon: '📋', detail: new Date(ticket.created_at).toLocaleDateString() },
    { label: 'In Progress', icon: '🔧', detail: activeStep >= 1 ? 'Assigned' : 'Pending' },
    { label: 'Scheduled', icon: '📅', detail: activeStep >= 2 ? 'Confirmed' : 'TBD' },
    { label: 'Resolved', icon: '✓', detail: activeStep >= 3 ? 'Complete' : 'Pending' },
  ]

  return (
    <div style={{
      background: T.bgCard, borderRadius: '12px', padding: '18px',
      border: `1px solid ${T.tanFaded}`, marginBottom: '20px',
    }}>
      <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '4px' }}>
        Active Ticket
      </div>
      <div style={{ fontSize: '13px', color: T.tan, marginBottom: '20px' }}>
        {ticket.category} — {ticket.description.length > 50 ? ticket.description.slice(0, 50) + '…' : ticket.description}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', padding: '0 4px' }}>
        {/* Track line */}
        <div style={{
          position: 'absolute', top: '16px', left: '20px', right: '20px',
          height: '2px', background: T.tanFaded,
        }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${T.olive}, ${T.terra})`,
            width: `${(activeStep / 3) * 100}%`,
            transition: 'width 600ms cubic-bezier(0.34,1.56,0.64,1)',
            borderRadius: '2px',
            boxShadow: `0 0 8px ${T.terraGlow}`,
          }} />
        </div>

        {steps.map((step, i) => (
          <div key={i} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '6px', position: 'relative', zIndex: 1,
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px',
              background: i <= activeStep ? (i === activeStep ? T.terra : T.olive) : T.bgHover,
              border: `2px solid ${i <= activeStep ? (i === activeStep ? T.terra : T.olive) : T.tanGhost}`,
              color: i <= activeStep ? '#fff' : T.textDim,
              transition: 'all 400ms cubic-bezier(0.34,1.56,0.64,1)',
              transform: i === activeStep ? 'scale(1.15)' : 'scale(1)',
              boxShadow: i === activeStep ? `0 0 16px ${T.terraGlow}` : 'none',
            }}>
              {step.icon}
            </div>
            <div style={{
              fontSize: '9px', letterSpacing: '0.5px', textAlign: 'center',
              color: i <= activeStep ? T.tan : T.textDim,
              fontWeight: i === activeStep ? 500 : 400,
            }}>
              {step.label}
            </div>
            <div style={{ fontSize: '9px', color: T.textDim, fontFamily: mono, textAlign: 'center' }}>
              {step.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const STATUS_COLOR = {
  open: { bg: 'rgba(194,112,62,0.1)', color: '#C2703E', border: 'rgba(194,112,62,0.3)' },
  in_progress: { bg: 'rgba(196,168,130,0.08)', color: '#C4A882', border: 'rgba(196,168,130,0.2)' },
  resolved: { bg: 'rgba(107,132,85,0.12)', color: '#6B8455', border: 'rgba(107,132,85,0.3)' },
  closed: { bg: T.tanFaded, color: T.textMid, border: T.tanGhost },
}

export default function MaintenanceForm() {
  const { user } = useAuth()
  const { tickets, loading, refetch } = useMaintenance(user?.id, false)
  const [unitId, setUnitId] = useState(null)
  const [category, setCategory] = useState('Plumbing')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [photoUrls, setPhotoUrls] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('tenants')
      .select('unit_id')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data) setUnitId(data.unit_id) })
  }, [user])

  async function handleSubmit() {
    if (!description.trim()) { setError('Please describe the issue.'); return }
    if (!unitId) { setError('Your unit could not be determined. Contact your manager.'); return }
    setError(null)
    setSubmitting(true)
    try {
      const { error: insertErr } = await supabase.from('maintenance').insert({
        tenant_id: user.id, unit_id: unitId, category,
        description: description.trim(), priority, photo_urls: photoUrls,
      })
      if (insertErr) throw insertErr
      setSuccess(true)
      setDescription('')
      setPhotoUrls([])
      setCategory('Plumbing')
      setPriority('Medium')
      refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const activeTicket = tickets.find(t => t.status === 'open' || t.status === 'in_progress')

  return (
    <NavLayout>
      <div style={{ maxWidth: '640px', margin: '0 auto', fontFamily: font }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, marginBottom: '24px', letterSpacing: '0.3px' }}>
          Maintenance
        </h1>

        {/* Active ticket tracker */}
        {activeTicket && <MaintenanceTracker ticket={activeTicket} />}

        {/* Submit form */}
        <div style={{
          background: T.bgCard, borderRadius: '14px', padding: '20px',
          border: `1px solid ${T.tanFaded}`, marginBottom: '24px',
        }}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '16px' }}>
            New Request
          </div>

          {success && (
            <div style={{
              background: T.oliveFaded, border: `1px solid ${T.oliveGlow}`,
              borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: T.olive,
              marginBottom: '16px',
            }}>
              Request submitted. We will follow up shortly.
            </div>
          )}
          {error && (
            <div style={{
              background: T.terraFaded, border: `1px solid ${T.terraGlow}`,
              borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: T.terra,
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', letterSpacing: '1px', color: T.textDim, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Category
                </label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}
                  onFocus={e => e.target.style.borderColor = T.terra}
                  onBlur={e => e.target.style.borderColor = T.tanFaded}
                >
                  {CATEGORIES.map(c => <option key={c} style={{ background: T.bgCard }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', letterSpacing: '1px', color: T.textDim, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Priority
                </label>
                <select value={priority} onChange={e => setPriority(e.target.value)} style={selectStyle}
                  onFocus={e => e.target.style.borderColor = T.terra}
                  onBlur={e => e.target.style.borderColor = T.tanFaded}
                >
                  {PRIORITIES.map(p => <option key={p} style={{ background: T.bgCard }}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', letterSpacing: '1px', color: T.textDim, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Description
              </label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                placeholder='Describe the issue in detail...'
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = T.terra}
                onBlur={e => e.target.style.borderColor = T.tanFaded}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', letterSpacing: '1px', color: T.textDim, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Photos (optional)
              </label>
              <FileUpload bucket='documents' pathPrefix='maintenance/photos' accept='image/*' multiple
                onUpload={urls => setPhotoUrls(prev => [...prev, ...urls])} />
              {photoUrls.length > 0 && (
                <p style={{ fontSize: '11px', color: T.textDim, marginTop: '6px' }}>
                  {photoUrls.length} photo{photoUrls.length !== 1 ? 's' : ''} attached
                </p>
              )}
            </div>

            <button onClick={handleSubmit} disabled={submitting} style={{
              padding: '13px', borderRadius: '10px', border: 'none',
              background: submitting ? T.bgHover : T.terra, color: submitting ? T.textMid : '#fff',
              fontSize: '13px', fontWeight: 500, fontFamily: font, cursor: submitting ? 'default' : 'pointer',
              letterSpacing: '0.3px', transition: 'all 300ms ease',
              boxShadow: submitting ? 'none' : `0 4px 16px ${T.terraGlow}`,
            }}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>

        {/* Ticket list */}
        <div>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '12px' }}>
            My Tickets
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                border: `2px solid ${T.terra}`, borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : tickets.length === 0 ? (
            <p style={{ fontSize: '13px', color: T.textDim }}>No tickets yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tickets.map(t => {
                const sc = STATUS_COLOR[t.status] || STATUS_COLOR.closed
                return (
                  <div key={t.id} style={{
                    background: T.bgCard, borderRadius: '10px', padding: '14px 16px',
                    border: `1px solid ${T.tanFaded}`,
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
                  }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: T.tan, margin: 0 }}>{t.category}</p>
                      <p style={{ fontSize: '12px', color: T.textMid, marginTop: '3px', lineHeight: 1.4 }}>
                        {t.description.length > 80 ? t.description.slice(0, 80) + '…' : t.description}
                      </p>
                      <p style={{ fontSize: '10px', color: T.textDim, marginTop: '6px', fontFamily: mono }}>
                        {new Date(t.created_at).toLocaleDateString()} · {t.priority}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: 500, padding: '4px 10px', borderRadius: '20px',
                      whiteSpace: 'nowrap', letterSpacing: '0.5px', textTransform: 'capitalize',
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                    }}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </NavLayout>
  )
}
