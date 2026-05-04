import { useRef, useState, useEffect } from 'react'
import NavLayout from '../shared/NavLayout'
import { useAuth } from '../../hooks/useAuth'
import { useLedger } from '../../hooks/useLedger'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

const STATUS_COLOR = {
  pending:    { bg: 'rgba(194,112,62,0.1)',   color: T.terra,   border: 'rgba(194,112,62,0.3)' },
  processing: { bg: 'rgba(100,130,200,0.1)',  color: '#7A9FC8', border: 'rgba(100,130,200,0.3)' },
  confirmed:  { bg: 'rgba(107,132,85,0.12)',  color: '#6B8455', border: 'rgba(107,132,85,0.3)' },
  failed:     { bg: 'rgba(180,60,60,0.1)',    color: '#C05050', border: 'rgba(180,60,60,0.3)'  },
  rejected:   { bg: 'rgba(180,60,60,0.1)',    color: '#C05050', border: 'rgba(180,60,60,0.3)'  },
  late:       { bg: 'rgba(194,112,62,0.15)',  color: T.terra,   border: T.terraGlow             },
}

function fmt(n) {
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function SummaryCard({ label, value, accent }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{
      background: T.bgCard, borderRadius: '12px', padding: '16px',
      border: `1px solid ${T.tanFaded}`, textAlign: 'center',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'all 500ms ease',
    }}>
      <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{
        fontSize: '20px', fontWeight: 300, fontFamily: mono,
        color: accent === 'red' ? T.terra : accent === 'green' ? '#6B8455' : T.tan,
      }}>
        {value}
      </div>
    </div>
  )
}

export default function PaymentHistory() {
  const { user } = useAuth()
  const { payments, charges, balance, totalCharged, totalPaid, loading } = useLedger(user?.id)

  if (loading) {
    return (
      <NavLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: `2px solid ${T.terra}`, borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </NavLayout>
    )
  }

  return (
    <NavLayout>
      <div style={{ maxWidth: '640px', margin: '0 auto', fontFamily: font }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, marginBottom: '24px', letterSpacing: '0.3px' }}>
          Payment History
        </h1>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '28px' }}>
          <SummaryCard label="Charged" value={fmt(totalCharged)} />
          <SummaryCard label="Paid" value={fmt(totalPaid)} accent="green" />
          <SummaryCard label="Balance" value={fmt(balance)} accent={balance > 0 ? 'red' : 'green'} />
        </div>

        {/* Payments */}
        <section style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '12px' }}>
            Payments
          </div>
          {payments.length === 0 ? (
            <p style={{ fontSize: '13px', color: T.textDim }}>No payments on record.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {payments.map(p => {
                const sc = STATUS_COLOR[p.status] ?? { bg: T.bgHover, color: T.textMid, border: T.tanGhost }
                return (
                  <div key={p.id} style={{
                    background: T.bgCard, borderRadius: '10px', padding: '14px 16px',
                    border: `1px solid ${T.tanFaded}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: T.tan, margin: 0, fontFamily: mono }}>
                        {fmt(p.amount)}
                      </p>
                      <p style={{ fontSize: '11px', color: T.textDim, marginTop: '3px' }}>
                        {p.method === 'ach' ? 'ACH' : 'Zelle'} · Due: {fmtDate(p.due_date)} · Paid: {fmtDate(p.paid_date)}
                      </p>
                      {p.reference_note && (
                        <p style={{ fontSize: '11px', color: T.textMid, marginTop: '3px' }}>
                          {p.reference_note}
                        </p>
                      )}
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: 500, padding: '4px 10px',
                      borderRadius: '20px', whiteSpace: 'nowrap', letterSpacing: '0.5px',
                      background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                    }}>
                      {p.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Charges */}
        <section>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '12px' }}>
            Charges
          </div>
          {charges.length === 0 ? (
            <p style={{ fontSize: '13px', color: T.textDim }}>No charges on record.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {charges.map(c => (
                <div key={c.id} style={{
                  background: T.bgCard, borderRadius: '10px', padding: '14px 16px',
                  border: `1px solid ${T.tanFaded}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: T.tan, margin: 0, textTransform: 'capitalize' }}>
                      {c.type.replace('_', ' ')}
                    </p>
                    <p style={{ fontSize: '11px', color: T.textDim, marginTop: '3px', fontFamily: mono }}>
                      {fmtDate(c.date)}
                    </p>
                    {c.notes && (
                      <p style={{ fontSize: '11px', color: T.textMid, marginTop: '3px' }}>{c.notes}</p>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: T.terra, margin: 0, fontFamily: mono }}>
                    {fmt(c.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </NavLayout>
  )
}
