import { useEffect, useState } from 'react'
import NavLayout from '../shared/NavLayout'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

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

export default function AnnouncementBoard() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [target, setTarget] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { data, error: fetchErr } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
      if (fetchErr) throw fetchErr
      setAnnouncements(data)
    } catch {
      // non-fatal
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handlePost() {
    if (!title.trim() || !body.trim()) {
      setError('Title and message are required.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const { error: insertErr } = await supabase.from('announcements').insert({
        title: title.trim(),
        body: body.trim(),
        target,
        created_by: user.id,
      })
      if (insertErr) throw insertErr
      setSuccess(true)
      setTitle('')
      setBody('')
      setTarget('all')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <NavLayout>
      <div style={{ maxWidth: '640px', margin: '0 auto', fontFamily: font }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, marginBottom: '24px', letterSpacing: '0.3px' }}>
          Announcements
        </h1>

        {/* Compose card */}
        <div style={{
          background: T.bgCard, borderRadius: '14px', padding: '20px',
          border: `1px solid ${T.tanFaded}`, marginBottom: '28px',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase' }}>
            New Announcement
          </div>

          {success && (
            <div style={{
              background: T.oliveFaded, border: `1px solid ${T.oliveGlow}`,
              borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: T.olive,
            }}>
              Announcement posted.
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

          <div>
            <label style={labelStyle}>Title</label>
            <input
              type='text'
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder='Scheduled maintenance this weekend'
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = T.terra}
              onBlur={e => e.target.style.borderColor = T.tanFaded}
            />
          </div>

          <div>
            <label style={labelStyle}>Message</label>
            <textarea
              rows={3}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder='Details...'
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => e.target.style.borderColor = T.terra}
              onBlur={e => e.target.style.borderColor = T.tanFaded}
            />
          </div>

          <div>
            <label style={labelStyle}>Audience</label>
            <select
              value={target}
              onChange={e => setTarget(e.target.value)}
              style={{ ...inputStyle, appearance: 'none' }}
              onFocus={e => e.target.style.borderColor = T.terra}
              onBlur={e => e.target.style.borderColor = T.tanFaded}
            >
              <option value='all' style={{ background: T.bgCard }}>All Tenants</option>
            </select>
            <p style={{ fontSize: '11px', color: T.textDim, marginTop: '5px' }}>
              Unit-targeted announcements: enter unit ID or leave as All.
            </p>
          </div>

          <button
            onClick={handlePost}
            disabled={submitting}
            style={{
              padding: '13px', borderRadius: '10px', border: 'none',
              background: submitting ? T.bgHover : T.terra,
              color: submitting ? T.textDim : '#fff',
              fontSize: '13px', fontWeight: 500, fontFamily: font,
              cursor: submitting ? 'default' : 'pointer',
              letterSpacing: '0.3px', transition: 'all 300ms ease',
              boxShadow: submitting ? 'none' : `0 4px 16px ${T.terraGlow}`,
            }}
          >
            {submitting ? 'Posting...' : 'Post Announcement'}
          </button>
        </div>

        {/* Posted list */}
        <section>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '12px' }}>
            Posted
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                border: `2px solid ${T.terra}`, borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : announcements.length === 0 ? (
            <p style={{ fontSize: '13px', color: T.textDim }}>No announcements yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {announcements.map(a => (
                <div key={a.id} style={{
                  background: T.bgCard, borderRadius: '10px', padding: '14px 16px',
                  border: `1px solid ${T.tanFaded}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: T.tan, margin: 0 }}>
                      {a.title}
                    </p>
                    <span style={{ fontSize: '10px', color: T.textDim, whiteSpace: 'nowrap', fontFamily: mono }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: T.textMid, margin: 0, lineHeight: 1.5 }}>{a.body}</p>
                  <p style={{ fontSize: '10px', color: T.textDim, marginTop: '6px', fontFamily: mono }}>
                    To: {a.target}
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
