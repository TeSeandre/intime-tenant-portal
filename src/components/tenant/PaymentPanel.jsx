import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import NavLayout from '../shared/NavLayout'
import { useAuth } from '../../hooks/useAuth'
import { useLedger } from '../../hooks/useLedger'
import { submitZellePayment, createAchPaymentIntent } from '../../lib/payments'
import { getStripe } from '../../lib/stripeClient'
import T from '../../lib/theme'

const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

const inputStyle = {
  width: '100%', background: T.bgHover, border: `1px solid ${T.tanFaded}`,
  borderRadius: '8px', padding: '10px 12px', fontSize: '13px',
  color: T.tan, fontFamily: font, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 200ms ease',
}

const stripeAppearance = {
  theme: T.isDark ? 'night' : 'flat',
  variables: {
    colorPrimary: T.terra,
    colorBackground: T.bgHover,
    colorText: T.tan,
    colorDanger: '#C05050',
    colorTextPlaceholder: T.textDim,
    fontFamily: font,
    borderRadius: '8px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: `1px solid ${T.tanFaded}`, boxShadow: 'none' },
    '.Input:focus': { border: `1px solid ${T.terra}`, boxShadow: 'none' },
    '.Label': { color: T.textMid, fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' },
  },
}

// ─── ACH inner form — must live inside <Elements> to access Stripe hooks ─────
function AchPaymentForm({ onSuccess, onError, onBack, submitting, setSubmitting }) {
  const stripe = useStripe()
  const elements = useElements()

  async function handleConfirm() {
    if (!stripe || !elements) return
    setSubmitting(true)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/tenant/payments',
      },
      redirect: 'if_required',
    })
    if (error) {
      onError(error.message)
      setSubmitting(false)
    } else {
      onSuccess(paymentIntent?.id)
    }
  }

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <PaymentElement
          options={{
            fields: {
              billingDetails: { name: 'auto', email: 'auto' },
            },
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onBack}
          style={{
            flex: '0 0 auto', padding: '12px 16px', borderRadius: '8px',
            border: `1px solid ${T.tanFaded}`, background: 'transparent',
            color: T.textMid, fontFamily: font, fontSize: '13px', cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting || !stripe || !elements}
          style={{
            flex: 1, padding: '14px', borderRadius: '10px', border: 'none',
            fontFamily: font, fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px',
            background: submitting ? T.bgHover : T.terra,
            color: submitting ? T.tanSoft : '#fff',
            cursor: submitting ? 'default' : 'pointer',
            position: 'relative', overflow: 'hidden',
            transition: 'all 300ms ease',
            boxShadow: submitting ? 'none' : `0 4px 16px ${T.terraGlow}`,
          }}
        >
          {submitting && (
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(90deg, transparent, ${T.tanFaded}, transparent)`,
              animation: 'shimmer 1.2s ease infinite',
            }} />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>
            {submitting ? 'Submitting...' : 'Confirm Bank Payment'}
          </span>
        </button>
      </div>
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PaymentPanel() {
  const { user } = useAuth()
  const { balance, loading: ledgerLoading } = useLedger(user?.id)

  const [method, setMethod] = useState('zelle') // 'zelle' | 'ach'

  // Shared inputs
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')

  // Zelle-only
  const [referenceNote, setReferenceNote] = useState('')
  const [zelleBtnState, setZelleBtnState] = useState('idle') // idle | processing | success
  const [zelleError, setZelleError] = useState(null)
  const [zelleSubmittedAmount, setZelleSubmittedAmount] = useState(null)

  // ACH-only
  const [achStep, setAchStep] = useState('enter') // enter | stripe | success
  const [achError, setAchError] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [achSubmitting, setAchSubmitting] = useState(false)
  const [achSubmittedAmount, setAchSubmittedAmount] = useState(null)
  const [achPaymentIntentId, setAchPaymentIntentId] = useState(null)

  const fmt = n => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  function switchMethod(m) {
    setMethod(m)
    setZelleError(null)
    setAchError(null)
    // Reset ACH back to entry step if switching away and back
    if (m === 'ach') setAchStep('enter')
  }

  // ── Zelle submit ──────────────────────────────────────────────────────────
  async function handleZelleSubmit() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setZelleError('Enter a valid payment amount.')
      return
    }
    if (Number(amount) > 50000) {
      setZelleError('Amount exceeds maximum. Contact your property manager for large payments.')
      return
    }
    setZelleError(null)
    setZelleBtnState('processing')
    try {
      const { error: payErr } = await submitZellePayment({
        amount: Number(amount),
        dueDate: dueDate || null,
        referenceNote: referenceNote.trim() || null,
      })
      if (payErr) throw payErr
      setZelleSubmittedAmount(Number(amount))
      setZelleBtnState('success')
      setAmount('')
      setReferenceNote('')
      setDueDate('')
    } catch (err) {
      setZelleError(err.message ?? 'Submission failed. Try again.')
      setZelleBtnState('idle')
    }
  }

  // ── ACH: step 1 → initialize PaymentIntent ───────────────────────────────
  async function handleAchSetup() {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setAchError('Enter a valid payment amount.')
      return
    }
    if (Number(amount) > 50000) {
      setAchError('Amount exceeds maximum. Contact your property manager for large payments.')
      return
    }
    setAchError(null)
    setAchSubmitting(true)
    try {
      const { clientSecret: cs } = await createAchPaymentIntent({
        amount: Number(amount),
        dueDate: dueDate || null,
      })
      setClientSecret(cs)
      setAchSubmitting(false)
      setAchStep('stripe')
    } catch (err) {
      setAchError(err.message ?? 'Could not initialize payment. Try again.')
      setAchSubmitting(false)
    }
  }

  // ── ACH: step 2 → Stripe confirms ────────────────────────────────────────
  function handleAchSuccess(paymentIntentId) {
    setAchSubmittedAmount(Number(amount))
    setAchPaymentIntentId(paymentIntentId)
    setAmount('')
    setDueDate('')
    setAchStep('success')
  }

  function handleAchBack() {
    setClientSecret(null)
    setAchStep('enter')
    setAchError(null)
  }

  // ── Derived button styling for Zelle ─────────────────────────────────────
  const zelleBg     = zelleBtnState === 'success' ? T.olive : zelleBtnState === 'processing' ? T.bgHover : T.terra
  const zelleColor  = zelleBtnState === 'processing' ? T.tanSoft : '#fff'
  const zelleShadow = zelleBtnState === 'success' ? `0 0 24px ${T.oliveGlow}` : `0 4px 16px ${T.terraGlow}`

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

        {/* Payment method selector */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '20px',
          background: T.bgCard, borderRadius: '10px', padding: '6px',
          border: `1px solid ${T.tanFaded}`,
        }}>
          {[
            { key: 'zelle', label: 'Zelle' },
            { key: 'ach',   label: 'Bank Transfer (ACH)' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => switchMethod(key)}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: '7px', border: 'none',
                fontFamily: font, fontSize: '12px', fontWeight: 500, letterSpacing: '0.3px',
                cursor: 'pointer', transition: 'all 200ms ease',
                background: method === key ? T.terra : 'transparent',
                color: method === key ? '#fff' : T.textMid,
                boxShadow: method === key ? `0 2px 10px ${T.terraGlow}` : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── ZELLE FLOW ─────────────────────────────────────────────────── */}
        {method === 'zelle' && (
          <>
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

            {zelleError && <ErrorBanner msg={zelleError} />}

            <div style={{
              background: T.bgCard, borderRadius: '14px', padding: '20px',
              border: `1px solid ${T.tanFaded}`, display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <AmountField amount={amount} setAmount={setAmount} />
              <DueDateField dueDate={dueDate} setDueDate={setDueDate} />

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

              <button
                onClick={zelleBtnState === 'idle' ? handleZelleSubmit : undefined}
                style={{
                  padding: '14px', borderRadius: '10px', border: 'none',
                  fontFamily: font, fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px',
                  cursor: zelleBtnState === 'idle' ? 'pointer' : 'default',
                  position: 'relative', overflow: 'hidden',
                  background: zelleBg, color: zelleColor,
                  transition: 'all 500ms cubic-bezier(0.34,1.56,0.64,1)',
                  transform: zelleBtnState === 'success' ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: zelleShadow,
                }}
              >
                {zelleBtnState === 'processing' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(90deg, transparent, ${T.tanFaded}, transparent)`,
                    animation: 'shimmer 1.2s ease infinite',
                  }} />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {zelleBtnState === 'idle' && 'Submit Payment Notification'}
                  {zelleBtnState === 'processing' && 'Processing...'}
                  {zelleBtnState === 'success' && '✓ Submitted for Review'}
                </span>
              </button>
            </div>

            {/* Zelle receipt */}
            <div style={{
              marginTop: '12px', borderRadius: '10px', overflow: 'hidden',
              background: T.bgCard, border: `1px solid ${T.tanFaded}`,
              maxHeight: zelleBtnState === 'success' ? '200px' : '0',
              opacity: zelleBtnState === 'success' ? 1 : 0,
              transition: 'all 600ms cubic-bezier(0.34,1.56,0.64,1) 200ms',
              padding: zelleBtnState === 'success' ? '16px' : '0 16px',
            }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '12px' }}>
                Submission Receipt
              </div>
              {[
                ['Amount', zelleSubmittedAmount ? fmt(zelleSubmittedAmount) : '—'],
                ['Method', 'Zelle'],
                ['Status', 'Pending Manager Review'],
              ].map(([label, val], i) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                  borderBottom: i < 2 ? `1px solid ${T.tanFaded}` : 'none',
                  opacity: zelleBtnState === 'success' ? 1 : 0,
                  transform: zelleBtnState === 'success' ? 'translateX(0)' : 'translateX(-10px)',
                  transition: `all 400ms ease ${300 + i * 100}ms`,
                }}>
                  <span style={{ fontSize: '12px', color: T.textMid }}>{label}</span>
                  <span style={{ fontSize: '12px', color: T.tan, fontFamily: mono }}>{val}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ACH FLOW ───────────────────────────────────────────────────── */}
        {method === 'ach' && (
          <>
            {/* ACH info banner */}
            <div style={{
              background: T.bgCard, borderRadius: '10px', padding: '14px 16px',
              border: `1px solid ${T.tanFaded}`, marginBottom: '20px',
              borderLeft: `3px solid ${T.terra}`,
            }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: T.terra, marginBottom: '6px', letterSpacing: '0.3px' }}>
                Bank Transfer (ACH)
              </p>
              <p style={{ fontSize: '12px', color: T.textMid, margin: 0 }}>
                Pay directly from your bank account. ACH payments settle in 3–5 business days.
                You will see a <strong style={{ color: T.tan }}>processing</strong> status until your bank confirms the transfer.
              </p>
            </div>

            {achError && <ErrorBanner msg={achError} />}

            {/* Step: enter amount */}
            {achStep === 'enter' && (
              <div style={{
                background: T.bgCard, borderRadius: '14px', padding: '20px',
                border: `1px solid ${T.tanFaded}`, display: 'flex', flexDirection: 'column', gap: '16px',
              }}>
                <AmountField amount={amount} setAmount={setAmount} />
                <DueDateField dueDate={dueDate} setDueDate={setDueDate} />

                <button
                  onClick={achSubmitting ? undefined : handleAchSetup}
                  style={{
                    padding: '14px', borderRadius: '10px', border: 'none',
                    fontFamily: font, fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px',
                    cursor: achSubmitting ? 'default' : 'pointer',
                    position: 'relative', overflow: 'hidden',
                    background: achSubmitting ? T.bgHover : T.terra,
                    color: achSubmitting ? T.tanSoft : '#fff',
                    transition: 'all 300ms ease',
                    boxShadow: achSubmitting ? 'none' : `0 4px 16px ${T.terraGlow}`,
                  }}
                >
                  {achSubmitting && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(90deg, transparent, ${T.tanFaded}, transparent)`,
                      animation: 'shimmer 1.2s ease infinite',
                    }} />
                  )}
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {achSubmitting ? 'Initializing...' : 'Continue to Bank Details →'}
                  </span>
                </button>
              </div>
            )}

            {/* Step: Stripe Payment Element */}
            {achStep === 'stripe' && clientSecret && (
              <div style={{
                background: T.bgCard, borderRadius: '14px', padding: '20px',
                border: `1px solid ${T.tanFaded}`,
              }}>
                <div style={{ fontSize: '11px', letterSpacing: '1px', color: T.textDim, textTransform: 'uppercase', marginBottom: '14px' }}>
                  Enter Bank Details
                </div>
                <Elements
                  stripe={getStripe()}
                  options={{ clientSecret, appearance: stripeAppearance }}
                >
                  <AchPaymentForm
                    onSuccess={handleAchSuccess}
                    onError={msg => setAchError(msg)}
                    onBack={handleAchBack}
                    submitting={achSubmitting}
                    setSubmitting={setAchSubmitting}
                  />
                </Elements>
              </div>
            )}

            {/* Step: success */}
            {achStep === 'success' && (
              <div style={{
                background: T.bgCard, borderRadius: '14px', padding: '24px',
                border: `1px solid ${T.tanFaded}`,
              }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: `rgba(107,132,85,0.15)`, border: `2px solid ${T.olive}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px', fontSize: '20px',
                  }}>
                    ✓
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: T.tan, margin: 0 }}>
                    Bank Payment Submitted
                  </p>
                  <p style={{ fontSize: '12px', color: T.textMid, marginTop: '6px' }}>
                    Your ACH transfer is being processed. Settlement takes 3–5 business days.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {[
                    ['Amount',  achSubmittedAmount ? fmt(achSubmittedAmount) : '—'],
                    ['Method',  'ACH Bank Transfer'],
                    ['Status',  'Processing'],
                    ...(achPaymentIntentId ? [['Reference', achPaymentIntentId]] : []),
                  ].map(([label, val], i, arr) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                      borderBottom: i < arr.length - 1 ? `1px solid ${T.tanFaded}` : 'none',
                    }}>
                      <span style={{ fontSize: '12px', color: T.textMid }}>{label}</span>
                      <span style={{ fontSize: '12px', color: T.tan, fontFamily: mono, wordBreak: 'break-all', textAlign: 'right', maxWidth: '260px' }}>{val}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setAchStep('enter'); setAchError(null) }}
                  style={{
                    marginTop: '16px', width: '100%', padding: '12px',
                    borderRadius: '8px', border: `1px solid ${T.tanFaded}`,
                    background: 'transparent', color: T.textMid,
                    fontFamily: font, fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  Make Another Payment
                </button>
              </div>
            )}
          </>
        )}

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

// ─── Shared sub-components ────────────────────────────────────────────────────

function ErrorBanner({ msg }) {
  return (
    <div style={{
      background: 'rgba(194,112,62,0.08)', border: `1px solid ${T.terraGlow}`,
      borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: T.terra,
      marginBottom: '16px',
    }}>
      {msg}
    </div>
  )
}

function AmountField({ amount, setAmount }) {
  return (
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
  )
}

function DueDateField({ dueDate, setDueDate }) {
  return (
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
  )
}
