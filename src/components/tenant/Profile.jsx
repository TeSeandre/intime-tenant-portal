import { useEffect, useState } from 'react'
import NavLayout from '../shared/NavLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"

const inputStyle = {
  width: '100%', background: T.bgHover, border: `1px solid ${T.tanFaded}`,
  borderRadius: '8px', padding: '10px 12px', fontSize: '13px',
  color: T.tan, fontFamily: font, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 200ms ease',
}

const labelStyle = {
  fontSize: '11px', letterSpacing: '1px', color: T.textDim,
  textTransform: 'uppercase', display: 'block', marginBottom: '6px',
}

export default function Profile() {
  const { user, profile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setPhone(profile.phone ?? '')
    }
  }, [profile])

  async function handleSave() {
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), phone: phone.trim() })
        .eq('id', user.id)
      if (updateErr) throw updateErr
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <NavLayout>
      <div style={{ maxWidth: '480px', margin: '0 auto', fontFamily: font }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, marginBottom: '24px', letterSpacing: '0.3px' }}>
          Profile
        </h1>

        <div style={{
          background: T.bgCard, borderRadius: '14px', padding: '22px',
          border: `1px solid ${T.tanFaded}`,
          display: 'flex', flexDirection: 'column', gap: '18px',
        }}>
          {success && (
            <div style={{
              background: T.oliveFaded, border: `1px solid ${T.oliveGlow}`,
              borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: T.olive,
            }}>
              Profile updated.
            </div>
          )}
          {error && (
            <div style={{
              background: T.terraFaded, border: `1px solid ${T.terraGlow}`,
              borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: T.terra,
            }}>
              {error}
            </div>
          )}

          {/* Email (read-only) */}
          <div>
            <label style={labelStyle}>Email</label>
            <p style={{ fontSize: '13px', color: T.textMid, margin: 0 }}>{user?.email}</p>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor='fullName' style={labelStyle}>Full Name</label>
            <input
              id='fullName'
              type='text'
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder='Jane Doe'
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = T.terra}
              onBlur={e => e.target.style.borderColor = T.tanFaded}
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor='phone' style={labelStyle}>Phone</label>
            <input
              id='phone'
              type='tel'
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder='(555) 000-0000'
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = T.terra}
              onBlur={e => e.target.style.borderColor = T.tanFaded}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '13px', borderRadius: '10px', border: 'none',
              background: saving ? T.bgHover : T.terra,
              color: saving ? T.textMid : '#fff',
              fontSize: '13px', fontWeight: 500, fontFamily: font,
              cursor: saving ? 'default' : 'pointer',
              letterSpacing: '0.3px', transition: 'all 300ms ease',
              boxShadow: saving ? 'none' : `0 4px 16px ${T.terraGlow}`,
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </NavLayout>
  )
}
