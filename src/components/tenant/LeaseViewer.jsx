import { useEffect, useState } from 'react'
import NavLayout from '../shared/NavLayout'
import SignaturePad from '../shared/SignaturePad'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { embedSignature, uploadSignedLease } from '../../lib/pdfUtils'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

function leaseProgress(startDate, endDate) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = Date.now()
  return Math.min(Math.max(Math.round(((now - start) / (end - start)) * 100), 0), 100)
}

export default function LeaseViewer() {
  const { user, profile } = useAuth()
  const [lease, setLease] = useState(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [showPad, setShowPad] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('leases')
          .select('*')
          .eq('tenant_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr
        setLease(data ?? null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function handleSign(sigDataUrl) {
    if (!lease?.pdf_url) return
    setError(null)
    setSigning(true)
    try {
      const signedAt = new Date()
      const pdfBytes = await embedSignature(lease.pdf_url, sigDataUrl, profile?.full_name ?? 'Tenant', signedAt)
      const signedUrl = await uploadSignedLease(lease.id, pdfBytes)
      const { error: updateErr } = await supabase
        .from('leases')
        .update({ pdf_url: signedUrl, signed_at: signedAt.toISOString(), signature_data: sigDataUrl })
        .eq('id', lease.id)
      if (updateErr) throw updateErr
      setLease(prev => ({ ...prev, pdf_url: signedUrl, signed_at: signedAt.toISOString() }))
      setShowPad(false)
      setSuccessMsg('Lease signed successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSigning(false)
    }
  }

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

  const progress = lease ? leaseProgress(lease.start_date, lease.end_date) : 0
  const isSigned = !!lease?.signed_at

  return (
    <NavLayout>
      <div style={{ maxWidth: '580px', margin: '0 auto', fontFamily: font }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, marginBottom: '24px', letterSpacing: '0.3px' }}>
          Your Lease
        </h1>

        {error && (
          <div style={{
            background: T.terraFaded, border: `1px solid ${T.terraGlow}`,
            borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: T.terra, marginBottom: '16px',
          }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{
            background: T.oliveFaded, border: `1px solid ${T.oliveGlow}`,
            borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: T.olive, marginBottom: '16px',
          }}>
            {successMsg}
          </div>
        )}

        {!lease ? (
          <p style={{ fontSize: '13px', color: T.textDim }}>No lease on file. Contact your property manager.</p>
        ) : (
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              background: T.bgCard, borderRadius: '14px', padding: '22px',
              border: `1px solid ${hovered ? T.terra : T.tanFaded}`,
              position: 'relative', overflow: 'hidden',
              transition: 'all 400ms cubic-bezier(0.34,1.56,0.64,1)',
              transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: hovered
                ? `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${T.terraGlow}`
                : '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex', flexDirection: 'column', gap: '18px',
            }}
          >
            {/* Corner glow */}
            <div style={{
              position: 'absolute', top: '-40px', right: '-40px',
              width: '120px', height: '120px', borderRadius: '50%',
              background: `radial-gradient(circle, ${T.terraGlow} 0%, transparent 70%)`,
              opacity: hovered ? 1 : 0, transition: 'opacity 500ms ease', pointerEvents: 'none',
            }} />

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Active Lease
                </div>
                <div style={{ fontSize: '15px', color: T.tan, fontWeight: 500 }}>
                  {profile?.full_name ?? 'Tenant'}
                </div>
                <div style={{ fontSize: '12px', color: T.textMid, marginTop: '3px', fontFamily: mono }}>
                  {new Date(lease.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' → '}
                  {new Date(lease.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '10px',
                letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 500,
                background: isSigned ? T.oliveFaded : T.terraFaded,
                color: isSigned ? T.olive : T.terra,
                border: `1px solid ${isSigned ? T.oliveGlow : T.terraGlow}`,
              }}>
                {isSigned ? 'Signed' : 'Unsigned'}
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: T.textDim }}>Lease Progress</span>
                <span style={{ fontSize: '10px', color: T.textMid, fontFamily: mono }}>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: T.tanFaded, borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: hovered ? `${progress}%` : `${Math.max(progress - 3, 0)}%`,
                  background: `linear-gradient(90deg, ${T.olive}, ${T.terra})`,
                  borderRadius: '4px', transition: 'width 600ms cubic-bezier(0.34,1.56,0.64,1)',
                  boxShadow: hovered ? `0 0 8px ${T.oliveGlow}` : 'none',
                }} />
              </div>
            </div>

            {/* Hover actions */}
            <div style={{
              display: 'flex', gap: '10px', flexWrap: 'wrap',
              maxHeight: hovered ? '50px' : '0',
              opacity: hovered ? 1 : 0,
              transition: 'all 400ms cubic-bezier(0.34,1.56,0.64,1)',
              overflow: 'hidden',
            }}>
              {lease.pdf_url && (
                <a href={lease.pdf_url} target='_blank' rel='noreferrer' style={{
                  fontSize: '11px', letterSpacing: '0.5px', color: T.terra,
                  padding: '6px 12px', borderRadius: '6px', background: T.terraFaded,
                  border: `1px solid ${T.terraGlow}`, textDecoration: 'none',
                  transform: hovered ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'all 300ms ease 0ms',
                }}>
                  View PDF
                </a>
              )}
              {!isSigned && lease.pdf_url && (
                <button onClick={() => setShowPad(!showPad)} style={{
                  fontSize: '11px', letterSpacing: '0.5px', color: T.terra,
                  padding: '6px 12px', borderRadius: '6px', background: T.terraFaded,
                  border: `1px solid ${T.terraGlow}`, cursor: 'pointer', fontFamily: font,
                  transform: hovered ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'all 300ms ease 80ms',
                }}>
                  {showPad ? 'Cancel' : 'Sign Lease'}
                </button>
              )}
            </div>

            {/* Signature pad */}
            {showPad && !isSigned && (
              <div>
                {signing && (
                  <p style={{ fontSize: '12px', color: T.textMid, marginBottom: '8px' }}>Embedding signature...</p>
                )}
                <SignaturePad onSave={handleSign} onClear={() => {}} />
              </div>
            )}

            {isSigned && (
              <div style={{ fontSize: '11px', color: T.olive, fontFamily: mono }}>
                ✓ Signed {new Date(lease.signed_at).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
      </div>
    </NavLayout>
  )
}
