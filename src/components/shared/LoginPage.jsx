import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import T from '../../lib/theme'

const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

function HouseArt() {
  return (
    <svg viewBox="0 0 200 170" width="168" height="143" style={{ overflow: 'visible' }}>
      {[0,1,2,3,4,5].map(i => (
        <line key={`h${i}`} x1="20" y1={30+i*24} x2="180" y2={30+i*24} stroke={T.tanFaded} strokeWidth="0.5" />
      ))}
      {[0,1,2,3,4,5,6].map(i => (
        <line key={`v${i}`} x1={20+i*27} y1="30" x2={20+i*27} y2="150" stroke={T.tanFaded} strokeWidth="0.5" />
      ))}
      <line x1="25" y1="145" x2="175" y2="145" stroke={T.tanGhost} strokeWidth="1" />
      <rect x="50" y="138" width="100" height="7" rx="1" fill={T.tanFaded} stroke={T.tan} strokeWidth="1" />
      <rect x="55" y="100" width="90" height="38" fill={T.tanFaded} stroke={T.tan} strokeWidth="1.5" />
      <polygon points="100,60 45,100 155,100" fill={T.terraGlow} stroke={T.terra} strokeWidth="2" />
      <rect x="118" y="63" width="10" height="20" rx="1" fill="none" stroke={T.terra} strokeWidth="1.5" />
      <rect x="65" y="110" width="20" height="22" rx="2" fill={T.tanFaded} stroke={T.tan} strokeWidth="1.2" />
      <line x1="75" y1="110" x2="75" y2="132" stroke={T.tan} strokeWidth="0.8" />
      <line x1="65" y1="121" x2="85" y2="121" stroke={T.tan} strokeWidth="0.8" />
      <rect x="115" y="110" width="20" height="22" rx="2" fill={T.tanFaded} stroke={T.tan} strokeWidth="1.2" />
      <line x1="125" y1="110" x2="125" y2="132" stroke={T.tan} strokeWidth="0.8" />
      <line x1="115" y1="121" x2="135" y2="121" stroke={T.tan} strokeWidth="0.8" />
      <rect x="90" y="116" width="20" height="22" rx="2" fill={T.terraFaded} stroke={T.terra} strokeWidth="1.2" />
      <circle cx="107" cy="127" r="1.5" fill={T.terra} />
      <ellipse cx="45" cy="143" rx="10" ry="5" fill={T.oliveFaded} stroke={T.tanGhost} strokeWidth="1" />
      <ellipse cx="158" cy="143" rx="10" ry="5" fill={T.oliveFaded} stroke={T.tanGhost} strokeWidth="1" />
    </svg>
  )
}

function InputField({ id, label, type, value, onChange, onKeyDown, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{
        fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
        color: T.textDim, fontFamily: font,
      }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          background: T.bgHover,
          border: `1px solid ${focused ? T.terra : T.tanFaded}`,
          borderRadius: '8px',
          padding: '11px 14px',
          color: T.tan,
          fontFamily: font,
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 200ms ease, box-shadow 200ms ease',
          boxShadow: focused ? `0 0 0 3px ${T.terraGlow}` : 'none',
          width: '100%',
        }}
      />
    </div>
  )
}

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitState, setSubmitState] = useState('idle') // 'idle' | 'processing' | 'success'
  const [mode, setMode] = useState('login') // 'login' | 'recovery'
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    async function handleAuthCallback() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)
        window.history.replaceState(null, '', window.location.pathname)
        if (exchangeErr) { setError('Link expired or invalid. Request a new one.'); return }
        if (data?.session) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user?.recovery_sent_at) { setMode('recovery') }
          else { redirectByRole(data.session.user.id) }
        }
        return
      }

      const hash = window.location.hash
      if (!hash) return
      const hashParams = new URLSearchParams(hash.replace('#', ''))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')
      if (!accessToken) return

      const { data, error: sessionErr } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') ?? '',
      })
      window.history.replaceState(null, '', window.location.pathname)
      if (sessionErr) { setError('Link expired or invalid. Request a new one.'); return }
      if (type === 'recovery') { setMode('recovery') }
      else if (data?.session) { redirectByRole(data.session.user.id) }
    }

    async function redirectByRole(userId) {
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', userId).single()
      navigate(profile?.role === 'admin' ? '/admin/dashboard' : '/tenant/dashboard')
    }

    handleAuthCallback()
  }, [])

  async function handleLogin() {
    if (!email || !password) { setError('Email and password are required.'); return }
    setError(null)
    setSubmitState('processing')
    try {
      await signIn(email, password)
      setSubmitState('success')
      setTimeout(() => navigate('/'), 750)
    } catch (err) {
      setSubmitState('idle')
      setError(err.message ?? 'Login failed. Check your credentials.')
    }
  }

  async function handleSetPassword() {
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    setError(null)
    setSubmitState('processing')
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
      if (updateErr) throw updateErr
      setSubmitState('success')
      setTimeout(() => { setMode('login'); setSubmitState('idle') }, 1600)
    } catch (err) {
      setSubmitState('idle')
      setError(err.message ?? 'Failed to set password.')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') mode === 'recovery' ? handleSetPassword() : handleLogin()
  }

  const isProcessing = submitState === 'processing'
  const isSuccess = submitState === 'success'

  const btnBg = isSuccess ? T.olive : isProcessing ? T.bgHover : T.terra
  const btnColor = isProcessing ? T.tanSoft : '#fff'
  const btnShadow = isSuccess
    ? `0 0 28px ${T.oliveGlow}, 0 4px 16px rgba(0,0,0,0.3)`
    : isProcessing ? 'none'
    : `0 4px 16px ${T.terraGlow}`

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: font, padding: '20px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@400;500&display=swap');
        @keyframes shimmer {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(220%) skewX(-15deg); }
        }
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-panel-left { display: none; }
        @media (min-width: 640px) { .login-panel-left { display: flex !important; } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Ambient background glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 50% at 30% 50%, ${T.terraGlow} 0%, transparent 70%)`,
      }} />

      {/* Card shell */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', width: '100%', maxWidth: '820px',
        borderRadius: '20px', overflow: 'hidden',
        border: `1px solid ${T.tanFaded}`,
        boxShadow: `0 32px 80px rgba(0,0,0,0.45)`,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 600ms ease, transform 600ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Left brand panel — desktop only */}
        <div className="login-panel-left" style={{
          flex: '0 0 340px', background: T.bgCard,
          borderRight: `1px solid ${T.tanFaded}`,
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 40px', gap: '28px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Corner glow */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: `radial-gradient(circle, ${T.terraGlow} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', left: '-40px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: `radial-gradient(circle, ${T.oliveGlow} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Brand */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{
              fontSize: '10px', letterSpacing: '4px', color: T.textDim,
              textTransform: 'uppercase', marginBottom: '12px', fontFamily: font,
            }}>
              An Omnivation Company
            </div>
            <div style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '26px', fontWeight: 400, letterSpacing: '0.5px', lineHeight: 1.1,
            }}>
              <span style={{ color: T.tan }}>In Time</span>
              <br />
              <span style={{ color: T.terra }}>Realty</span>
            </div>
          </div>

          {/* House illustration */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', width: '220px', height: '220px', borderRadius: '50%',
              background: `radial-gradient(circle, ${T.terraGlow} 0%, transparent 65%)`,
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }} />
            <HouseArt />
          </div>

          {/* Tagline */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{
              fontSize: '14px', color: T.textMid, fontWeight: 300, lineHeight: 1.6,
              fontFamily: font,
            }}>
              Renting made <span style={{ color: T.terra, fontWeight: 500 }}>simple</span>,<br />
              living made <span style={{ color: T.olive, fontWeight: 500 }}>home</span>.
            </div>
          </div>

          {/* Color swatches */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {[T.bgHover, T.tan, T.terra].map((c, i) => (
              <div key={i} style={{
                width: i === 0 ? 18 : i === 1 ? 12 : 7,
                height: 5, borderRadius: 3,
                background: c, border: `1px solid ${T.tanFaded}`,
              }} />
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div style={{
          flex: 1, background: T.bg, padding: '44px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '28px',
        }}>

          {/* Form header */}
          <div style={{ animation: 'loginFadeUp 500ms ease both' }}>
            <div style={{
              fontSize: '10px', letterSpacing: '3px', color: T.textDim,
              textTransform: 'uppercase', marginBottom: '8px', fontFamily: font,
            }}>
              {mode === 'recovery' ? 'Password Reset' : 'Tenant Portal'}
            </div>
            <h1 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '24px', fontWeight: 400, color: T.tan, margin: 0,
            }}>
              {mode === 'recovery' ? 'Set new password' : 'Welcome back'}
            </h1>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              background: T.terraFaded,
              border: `1px solid ${T.terra}`,
              borderLeft: `3px solid ${T.terra}`,
              borderRadius: '8px', padding: '12px 14px',
              animation: 'loginFadeUp 300ms ease both',
            }}>
              <span style={{ color: T.terra, fontSize: '13px', fontFamily: mono }}>!</span>
              <span style={{ fontSize: '13px', color: T.tan, fontFamily: font, lineHeight: 1.5 }}>
                {error}
              </span>
            </div>
          )}

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'loginFadeUp 500ms ease 80ms both' }}>
            {mode === 'recovery' ? (
              <InputField
                id="newPassword" label="New Password" type="password"
                autoComplete="new-password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="Min 6 characters"
              />
            ) : (
              <>
                <InputField
                  id="email" label="Email" type="email"
                  autoComplete="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder="you@example.com"
                />
                <InputField
                  id="password" label="Password" type="password"
                  autoComplete="current-password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder="••••••••"
                />
              </>
            )}
          </div>

          {/* Submit button */}
          <div style={{ animation: 'loginFadeUp 500ms ease 160ms both' }}>
            <button
              onClick={mode === 'recovery' ? handleSetPassword : handleLogin}
              disabled={isProcessing}
              style={{
                width: '100%', padding: '13px 24px',
                borderRadius: '10px', border: 'none',
                fontFamily: font, fontSize: '14px', fontWeight: 500,
                letterSpacing: '0.5px', cursor: isProcessing ? 'default' : 'pointer',
                position: 'relative', overflow: 'hidden',
                background: btnBg, color: btnColor,
                transition: 'all 450ms cubic-bezier(0.34,1.56,0.64,1)',
                transform: isSuccess ? 'scale(1.03)' : 'scale(1)',
                boxShadow: btnShadow,
              }}
            >
              {isProcessing && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(90deg, transparent, ${T.tanFaded}, transparent)`,
                  animation: 'shimmer 1.2s ease infinite',
                }} />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                {isSuccess
                  ? (mode === 'recovery' ? '✓ Password Updated' : '✓ Welcome back')
                  : isProcessing
                  ? (mode === 'recovery' ? 'Saving...' : 'Signing in...')
                  : (mode === 'recovery' ? 'Set Password' : 'Sign In')}
              </span>
            </button>
          </div>

          {/* Footer */}
          <div style={{
            fontSize: '11px', color: T.textDim, fontFamily: font,
            lineHeight: 1.6, animation: 'loginFadeUp 500ms ease 240ms both',
          }}>
            {mode === 'recovery'
              ? 'Your password will be updated and you can sign in normally.'
              : 'Contact your property manager to set up your account.'}
          </div>

          {/* Brand mark — mobile only */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="login-mobile-brand">
            <style>{`.login-mobile-brand { } @media (min-width: 640px) { .login-mobile-brand { display: none !important; } }`}</style>
            <div style={{ width: 24, height: 1, background: T.tanFaded }} />
            <span style={{ fontSize: '10px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase' }}>
              In Time Realty · Wichita, KS
            </span>
            <div style={{ width: 24, height: 1, background: T.tanFaded }} />
          </div>
        </div>
      </div>
    </div>
  )
}
