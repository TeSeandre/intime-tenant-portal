import { useState, useEffect } from 'react'
import NavLayout from '../shared/NavLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import T from '../../lib/theme'

const font = "'DM Sans', 'Avenir', sans-serif"
const serif = "'Playfair Display', 'Georgia', serif"

function StarPicker({ value, onChange }) {
  const [hov, setHov] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHov(n)}
          onMouseLeave={() => setHov(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '28px', padding: '2px',
            opacity: n <= (hov || value) ? 1 : 0.25,
            transform: n <= (hov || value) ? 'scale(1.15)' : 'scale(1)',
            transition: 'all 180ms cubic-bezier(0.34,1.56,0.64,1)',
            filter: n <= (hov || value) ? `drop-shadow(0 0 6px ${T.terraGlow})` : 'none',
          }}
        >⭐</button>
      ))}
    </div>
  )
}

export default function ReviewForm() {
  const { profile, session } = useAuth()
  const [existing, setExisting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quote, setQuote] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [unitLabel, setUnitLabel] = useState('')
  const [rating, setRating] = useState(5)
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [error, setError] = useState('')
  const charMax = 400

  useEffect(() => {
    if (!session) return
    supabase
      .from('reviews')
      .select('*')
      .eq('tenant_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setExisting(data)
        setLoading(false)
      })
  }, [session])

  useEffect(() => {
    if (profile?.full_name) setDisplayName(profile.full_name)
  }, [profile])

  async function handleSubmit(e) {
    e.preventDefault()
    if (quote.trim().length < 20) {
      setError('Review must be at least 20 characters.')
      setStatus('error')
      return
    }
    setStatus('sending')
    const { error: err } = await supabase.from('reviews').insert({
      tenant_id: session.user.id,
      display_name: displayName.trim() || 'Anonymous',
      unit_label: unitLabel.trim() || null,
      quote: quote.trim(),
      rating,
      approved: false,
    })
    if (err) {
      setError(err.message)
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  const cardStyle = {
    background: T.bgCard, borderRadius: '16px', padding: '32px',
    border: `1px solid ${T.tanFaded}`, maxWidth: '560px',
  }

  if (loading) return (
    <NavLayout>
      <div style={{ color: T.dim, fontSize: '14px', paddingTop: '40px' }}>Loading…</div>
    </NavLayout>
  )

  return (
    <NavLayout>
      <div style={{ maxWidth: '640px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', color: T.terra, textTransform: 'uppercase', marginBottom: '10px' }}>
          Tenant Review
        </div>
        <h1 style={{ fontSize: '26px', fontFamily: serif, fontWeight: 400, color: T.tan, margin: '0 0 6px' }}>
          Share your experience
        </h1>
        <p style={{ fontSize: '13px', color: T.mid, lineHeight: 1.7, marginBottom: '32px' }}>
          Your review helps future tenants know what it's like to rent with In Time Realty.
          Reviews are approved before going live — we never edit your words.
        </p>

        {existing ? (
          <div style={cardStyle}>
            <div style={{ fontSize: '22px', marginBottom: '12px' }}>
              {existing.approved ? '✅' : '⏳'}
            </div>
            <div style={{ fontSize: '15px', color: T.tan, fontWeight: 500, marginBottom: '6px' }}>
              {existing.approved ? 'Your review is live!' : 'Review pending approval'}
            </div>
            <div style={{ fontSize: '13px', color: T.mid, lineHeight: 1.7, fontStyle: 'italic', marginBottom: '16px' }}>
              "{existing.quote}"
            </div>
            <div style={{ fontSize: '11px', color: T.dim }}>
              {'⭐'.repeat(existing.rating)} · {existing.display_name}
              {existing.unit_label ? ` · ${existing.unit_label}` : ''}
            </div>
          </div>
        ) : status === 'success' ? (
          <div style={cardStyle}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</div>
            <div style={{ fontSize: '16px', color: T.tan, fontWeight: 500, marginBottom: '8px' }}>
              Review submitted!
            </div>
            <p style={{ fontSize: '13px', color: T.mid, lineHeight: 1.7 }}>
              We'll review it and post it to the site shortly. Thank you for taking the time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={cardStyle}>
            {/* Stars */}
            <div style={{ fontSize: '12px', color: T.dim, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Rating
            </div>
            <StarPicker value={rating} onChange={setRating} />

            {/* Quote */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: T.dim, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Your Review
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={quote}
                  onChange={e => { setQuote(e.target.value.slice(0, charMax)); if (status === 'error') setStatus('idle') }}
                  placeholder="What has your experience been like renting with In Time Realty?"
                  rows={5}
                  style={{
                    width: '100%', padding: '13px 14px', border: `1px solid ${T.tanGhost}`,
                    borderRadius: '10px', background: T.bg, color: T.tan,
                    fontSize: '13px', fontFamily: font, outline: 'none',
                    resize: 'vertical', lineHeight: 1.65,
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = T.terra}
                  onBlur={e => e.target.style.borderColor = T.tanGhost}
                />
                <div style={{
                  position: 'absolute', bottom: '10px', right: '12px',
                  fontSize: '10px', color: quote.length > charMax * 0.9 ? T.terra : T.dim,
                }}>
                  {quote.length}/{charMax}
                </div>
              </div>
            </div>

            {/* Display name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: T.dim, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="How you want to appear (e.g. Marcus T.)"
                style={{
                  width: '100%', padding: '11px 14px', border: `1px solid ${T.tanGhost}`,
                  borderRadius: '10px', background: T.bg, color: T.tan,
                  fontSize: '13px', fontFamily: font, outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = T.terra}
                onBlur={e => e.target.style.borderColor = T.tanGhost}
              />
            </div>

            {/* Unit label */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ fontSize: '12px', color: T.dim, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Unit / Property <span style={{ opacity: 0.5 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={unitLabel}
                onChange={e => setUnitLabel(e.target.value)}
                placeholder="e.g. Derby Duplex, Unit 8110"
                style={{
                  width: '100%', padding: '11px 14px', border: `1px solid ${T.tanGhost}`,
                  borderRadius: '10px', background: T.bg, color: T.tan,
                  fontSize: '13px', fontFamily: font, outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = T.terra}
                onBlur={e => e.target.style.borderColor = T.tanGhost}
              />
            </div>

            {status === 'error' && (
              <div style={{ fontSize: '12px', color: '#e74c3c', marginBottom: '16px' }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                background: status === 'sending' ? T.tanGhost : T.terra,
                color: '#fff', fontSize: '13px', fontWeight: 500,
                fontFamily: font, cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease',
                boxShadow: status === 'sending' ? 'none' : `0 4px 18px ${T.terraGlow}`,
              }}
            >
              {status === 'sending' ? 'Submitting…' : 'Submit Review'}
            </button>

            <div style={{ fontSize: '10px', color: T.dim, marginTop: '12px', textAlign: 'center' }}>
              Reviews are moderated before going live. We never alter your words.
            </div>
          </form>
        )}
      </div>
    </NavLayout>
  )
}
