import { useEffect, useState } from 'react'
import NavLayout from '../shared/NavLayout'
import MessageThread from '../shared/MessageThread'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"

export default function Inbox() {
  const { user } = useAuth()
  const [adminId, setAdminId] = useState(null)
  const [threadId, setThreadId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function setup() {
      try {
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
        if (!admins || admins.length === 0) return

        const aid = admins[0].id
        setAdminId(aid)

        const [a, b] = [user.id, aid].sort()
        setThreadId(`${a}-${b}`)
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    setup()
  }, [user])

  return (
    <NavLayout>
      <div style={{
        maxWidth: '640px', margin: '0 auto', fontFamily: font,
        display: 'flex', flexDirection: 'column', height: 'calc(100vh - 10rem)',
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, marginBottom: '20px', letterSpacing: '0.3px' }}>
          Inbox
        </h1>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: `2px solid ${T.terra}`, borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : !threadId ? (
          <p style={{ fontSize: '13px', color: T.textDim }}>
            No property manager found. Check back later.
          </p>
        ) : (
          <div style={{
            flex: 1, background: T.bgCard, borderRadius: '14px',
            border: `1px solid ${T.tanFaded}`, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '14px 18px',
              borderBottom: `1px solid ${T.tanFaded}`,
            }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: T.tan, margin: 0 }}>
                Property Manager
              </p>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <MessageThread threadId={threadId} recipientId={adminId} />
            </div>
          </div>
        )}
      </div>
    </NavLayout>
  )
}
