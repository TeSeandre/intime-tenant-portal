import { useEffect, useState } from 'react'
import NavLayout from '../shared/NavLayout'
import { useAuth } from '../../hooks/useAuth'
import { confirmPayment, rejectPayment } from '../../lib/payments'
import { supabase } from '../../lib/supabase'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_COLOR = {
  pending:   { bg: 'rgba(194,112,62,0.1)',  color: T.terra,   border: 'rgba(194,112,62,0.3)' },
  confirmed: { bg: 'rgba(107,132,85,0.12)', color: '#6B8455', border: 'rgba(107,132,85,0.3)' },
  rejected:  { bg: 'rgba(180,60,60,0.1)',   color: '#C05050', border: 'rgba(180,60,60,0.3)'  },
  late:      { bg: 'rgba(194,112,62,0.15)', color: T.terra,   border: T.terraGlow             },
}

export default function PaymentConfirm() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [filter, setFilter] = useState('pending')

  async function load() {
    setLoading(true)
    try {
      let query = supabase
        .from('payments')
        .select('*, tenants(name, email)')
        .order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data, error } = await query
      if (error) throw error
      setPayments(data)
    } catch {
      // non-fatal
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  async function handleConfirm(paymentId) {
    setProcessing(paymentId)
    try {
      const { error } = await confirmPayment(paymentId)
      if (error) throw error
      await load()
    } catch {
      // surface inline
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(paymentId) {
    setProcessing(paymentId)
    try {
      const { error } = await rejectPayment(paymentId)
      if (error) throw error
      await load()
    } catch {
      // surface inline
    } finally {
      setProcessing(null)
    }
  }

  const filters = ['pending', 'confirmed', 'rejected', 'all']

  return (
    <NavLayout>
      <div style={{ maxWidth: '640px', margin: '0 auto', fontFamily: font }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, marginBottom: '20px', letterSpacing: '0.3px' }}>
          Payments
        </h1>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '20px',
          borderBottom: `1px solid ${T.tanFaded}`,
        }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 14px', fontSize: '12px', fontWeight: 500,
                fontFamily: font, background: 'none', border: 'none', cursor: 'pointer',
                textTransform: 'capitalize', letterSpacing: '0.3px',
                borderBottom: filter === f ? `2px solid ${T.terra}` : '2px solid transparent',
                color: filter === f ? T.terra : T.textDim,
                transition: 'all 200ms ease',
                marginBottom: '-1px',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: `2px solid ${T.terra}`, borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : payments.length === 0 ? (
          <p style={{ fontSize: '13px', color: T.textDim }}>No {filter} payments.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {payments.map(p => {
              const sc = STATUS_COLOR[p.status] ?? { bg: T.bgHover, color: T.textMid, border: T.tanGhost }
              const busy = processing === p.id
              return (
                <div key={p.id} style={{
                  background: T.bgCard, borderRadius: '12px', padding: '16px',
                  border: `1px solid ${T.tanFaded}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: T.tan, margin: 0 }}>
                        {p.tenants?.name ?? 'Unknown'} —{' '}
                        <span style={{ fontFamily: mono }}>${Number(p.amount).toFixed(2)}</span>
                      </p>
                      <p style={{ fontSize: '11px', color: T.textDim, marginTop: '3px', fontFamily: mono }}>
                        {p.tenants?.email}
                      </p>
                      <p style={{ fontSize: '11px', color: T.textDim, marginTop: '3px' }}>
                        Due: {fmtDate(p.due_date)} · Submitted: {fmtDate(p.created_at)}
                      </p>
                      {p.reference_note && (
                        <p style={{
                          fontSize: '11px', color: T.textMid, marginTop: '6px',
                          background: T.bgHover, borderRadius: '6px', padding: '6px 10px',
                          wordBreak: 'break-all',
                        }}>
                          {p.reference_note}
                        </p>
                      )}
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: 500, padding: '4px 10px',
                      borderRadius: '20px', whiteSpace: 'nowrap', letterSpacing: '0.5px',
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                      flexShrink: 0,
                    }}>
                      {p.status}
                    </span>
                  </div>

                  {p.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        onClick={() => handleConfirm(p.id)}
                        disabled={busy}
                        style={{
                          flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                          background: busy ? T.bgHover : 'rgba(107,132,85,0.2)',
                          color: busy ? T.textDim : '#6B8455',
                          fontSize: '12px', fontWeight: 500, fontFamily: font,
                          cursor: busy ? 'default' : 'pointer',
                          letterSpacing: '0.3px', transition: 'all 200ms ease',
                          border: '1px solid rgba(107,132,85,0.3)',
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleReject(p.id)}
                        disabled={busy}
                        style={{
                          flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                          background: busy ? T.bgHover : 'rgba(180,60,60,0.1)',
                          color: busy ? T.textDim : '#C05050',
                          fontSize: '12px', fontWeight: 500, fontFamily: font,
                          cursor: busy ? 'default' : 'pointer',
                          letterSpacing: '0.3px', transition: 'all 200ms ease',
                          border: '1px solid rgba(180,60,60,0.3)',
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </NavLayout>
  )
}
