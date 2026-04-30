import { useEffect, useState } from 'react'
import NavLayout from '../shared/NavLayout'
import { useAuth } from '../../hooks/useAuth'
import { useLedger } from '../../hooks/useLedger'
import { submitZellePayment } from '../../lib/payments'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

const inputStyle = {
  width: '100%', background: T.bgHover, border: `1px solid ${T.tanFaded}`,
  borderRadius: '8px', padding: '10px 12px', fontSize: '13px',
  color: T.tan, fontFamily: font, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 200ms ease',
}

export default function PaymentPanel() {
  const { user } = useAuth()
  const { balance, loading: ledgerLoading } = useLedger(user?.id)
  const [amount, setAmount] = useState('')
  const [referenceNote, setReferenceNote] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [btnState, setBtnState] = useState('idle') // idle | processing | success
  const [error, setError] = useState(null)
  const [submittedAmount, setSubmittedAmount] = useState(null)

  const fmt = n => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  async function handleSubmit() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Enter a valid payment amount.')
      return
    }
    if (Number(amount) > 50000) {
      setError('Amount exceeds maximum. Contact your property manager for large payments.')
      return
    }
    setError(null)
    setBtnState('processing')
    try {
      const { error: payErr } = await submitZellePayment({
        amount: Number(amount),
        dueDate: dueDate || null,
        referenceNote: referenceNote.trim() || null,
      })
      if (payErr) throw payErr
      setSubmittedAmount(Number(amount))
      setBtnState('success')
      setAmount('')
      setReferenceNote('')
      setDueDate('')
    } catch (err) {
      setError(err.message ?? 'Submission failed. Try again.')
      setBtnState('idle')
    }
  }

  const btnBg = btnState === 'success' ? T.olive : btnState === 'processing' ? T.bgHover : T.terra
  const btnColor = btnState === 'processing' ? T.tanSoft : '#fff'
  const btnShadow = btnState === 'success' ? `0 0 24px ${T.oliveGlow}` : `0 4px 16px ${T.terraGlow}`

  return (
    <NavLayout>
      <div style={{ maxWidth: '520px', margin: '0 auto', fontFamily: font }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, marginBottom: '24px', letterSpacing: '0.3px' }}>
          Pay Rent
        </h1>

        {/* Balance card */}
        <div style={{
          background: T.bgCard, borderRadius: '14px', padding: '24px',
          border: `1px solid ${T.tanFaded}`, marginBottom: '20px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px',
            borderRadius: '50%', background: `radial-gradient(circle, ${T.terraGlow} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '8px' }}>
            Balance Due
          </div>
          <div style={{ fontSize: '36px', fontWeight: 300, color: balance > 0 ? T.terra : T.tan, fontFamily: mono }}>
            {ledgerLoading ? '—' : fmt(balance)}
          </div>
        </div>

        {/* Zelle instructions */}
        <div style={{
          background: T.bgCard, borderRadius: '10px', padding: '14px 16px',
          border: `1px solid ${T.tanFaded}`, marginBottom: '20px',
          borderLeft: `3px solid ${T.terra}`,
        }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: T.terra, marginBottom: '8px', letterSpacing: '0.3px' }}>
            How to pay with Zelle
          </p>
          <ol style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              'Open your bank app and send payment via Zelle.',
              'Note your Zelle confirmation number.',
              'Enter the amount and confirmation below.',
              'Your manager will confirm the payment.',
            ].map((step, i) => (
              <li key={i} style={{ fontSize: '12px', color: T.textMid }}>{step}</li>
            ))}
          </ol>
        </div>

        {error && (
          <div style={{
            background: 'rgba(194,112,62,0.08)', border: `1px solid ${T.terraGlow}`,
            borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: T.terra,
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{
          background: T.bgCard, borderRadius: '14px', padding: '20px',
          border: `1px solid ${T.tanFaded}`, display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          <div>
            <label style={{ fontSize: '11px', letterSpacing: '1px', color: T.textDim, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Amount ($)
            </label>
            <input
              type='number' min='1' step='0.01' value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder='0.00'
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = T.terra}
              onBlur={e => e.target.style.borderColor = T.tanFaded}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', letterSpacing: '1px', color: T.textDim, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Due Date (optional)
            </label>
            <input
              type='date' value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }}
              onFocus={e => e.target.style.borderColor = T.terra}
              onBlur={e => e.target.style.borderColor = T.tanFaded}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', letterSpacing: '1px', color: T.textDim, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Zelle Confirmation / Note
            </label>
            <textarea
              rows={2} value={referenceNote}
              onChange={e => setReferenceNote(e.target.value)}
              placeholder='Paste your Zelle confirmation number or note'
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => e.target.style.borderColor = T.terra}
              onBlur={e => e.target.style.borderColor = T.tanFaded}
            />
          </div>

          {/* Animated submit button */}
          <button
            onClick={btnState === 'idle' ? handleSubmit : undefined}
            style={{
              padding: '14px', borderRadius: '10px', border: 'none',
              fontFamily: font, fontSize: '13px', fontWeight: 500,
              letterSpacing: '0.5px', cursor: btnState === 'idle' ? 'pointer' : 'default',
              position: 'relative', overflow: 'hidden',
              background: btnBg, color: btnColor,
              transition: 'all 500ms cubic-bezier(0.34,1.56,0.64,1)',
              transform: btnState === 'success' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: btnShadow,
            }}
          >
            {btnState === 'processing' && (
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(90deg, transparent, ${T.tanFaded}, transparent)`,
                animation: 'shimmer 1.2s ease infinite',
              }} />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>
              {btnState === 'idle' && 'Submit Payment Notification'}
              {btnState === 'processing' && 'Processing...'}
              {btnState === 'success' && '✓ Submitted for Review'}
            </span>
          </button>
        </div>

        {/* Receipt slide-down */}
        <div style={{
          marginTop: '12px', borderRadius: '10px', overflow: 'hidden',
          background: T.bgCard, border: `1px solid ${T.tanFaded}`,
          maxHeight: btnState === 'success' ? '200px' : '0',
          opacity: btnState === 'success' ? 1 : 0,
          transition: 'all 600ms cubic-bezier(0.34,1.56,0.64,1) 200ms',
          padding: btnState === 'success' ? '16px' : '0 16px',
        }}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '12px' }}>
            Submission Receipt
          </div>
          {[
            ['Amount', submittedAmount ? fmt(submittedAmount) : '—'],
            ['Method', 'Zelle'],
            ['Status', 'Pending Manager Review'],
          ].map(([label, val], i) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', padding: '6px 0',
              borderBottom: i < 2 ? `1px solid ${T.tanFaded}` : 'none',
              opacity: btnState === 'success' ? 1 : 0,
              transform: btnState === 'success' ? 'translateX(0)' : 'translateX(-10px)',
              transition: `all 400ms ease ${300 + i * 100}ms`,
            }}>
              <span style={{ fontSize: '12px', color: T.textMid }}>{label}</span>
              <span style={{ fontSize: '12px', color: T.tan, fontFamily: mono }}>{val}</span>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        `}</style>
      </div>
    </NavLayout>
  )
}
