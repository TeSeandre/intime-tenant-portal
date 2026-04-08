import NavLayout from '../shared/NavLayout'
import { useAuth } from '../../hooks/useAuth'
import { useMaintenance } from '../../hooks/useMaintenance'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

const NEXT_STATUS = {
  open: 'in_progress',
  in_progress: 'resolved',
  resolved: 'closed',
}

const STATUS_COLOR = {
  open:        { bg: 'rgba(194,112,62,0.1)',   color: T.terra,   border: 'rgba(194,112,62,0.3)' },
  in_progress: { bg: 'rgba(196,168,130,0.08)', color: T.tan,     border: 'rgba(196,168,130,0.2)' },
  resolved:    { bg: 'rgba(107,132,85,0.12)',  color: '#6B8455', border: 'rgba(107,132,85,0.3)' },
  closed:      { bg: T.bgHover,               color: T.textDim, border: T.tanGhost              },
}

const PRIORITY_COLOR = {
  Low:       T.textDim,
  Medium:    T.tan,
  High:      T.terra,
  Emergency: '#C05050',
}

function TicketCard({ ticket, onUpdate }) {
  const next = NEXT_STATUS[ticket.status]
  const sc = STATUS_COLOR[ticket.status] ?? STATUS_COLOR.closed

  return (
    <div style={{
      background: T.bgCard, borderRadius: '10px', padding: '14px 16px',
      border: `1px solid ${T.tanFaded}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: next ? '10px' : 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: T.tan, margin: 0 }}>
            {ticket.category}{' '}
            <span style={{ fontSize: '11px', fontWeight: 400, color: PRIORITY_COLOR[ticket.priority] ?? T.textDim }}>
              {ticket.priority}
            </span>
          </p>
          <p style={{ fontSize: '12px', color: T.textMid, marginTop: '3px', lineHeight: 1.4 }}>
            {ticket.description}
          </p>
          {ticket.tenants && (
            <p style={{ fontSize: '11px', color: T.textDim, marginTop: '4px' }}>
              {ticket.tenants.name}
              {ticket.units && ` — ${ticket.units.address}${ticket.units.unit_number ? ' Unit ' + ticket.units.unit_number : ''}`}
            </p>
          )}
          <p style={{ fontSize: '10px', color: T.textDim, marginTop: '4px', fontFamily: mono }}>
            {new Date(ticket.created_at).toLocaleDateString()}
          </p>
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 500, padding: '4px 10px',
          borderRadius: '20px', whiteSpace: 'nowrap', letterSpacing: '0.5px',
          textTransform: 'capitalize', flexShrink: 0,
          background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
        }}>
          {ticket.status.replace('_', ' ')}
        </span>
      </div>

      {next && (
        <button
          onClick={() => onUpdate(ticket.id, next)}
          style={{
            padding: '7px 14px', borderRadius: '7px', border: `1px solid ${T.tanFaded}`,
            background: T.bgHover, color: T.tan,
            fontSize: '11px', fontFamily: font, cursor: 'pointer',
            letterSpacing: '0.3px', transition: 'all 200ms ease', textTransform: 'capitalize',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.terra; e.currentTarget.style.color = T.terra }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.tanFaded; e.currentTarget.style.color = T.tan }}
        >
          Mark {next.replace('_', ' ')}
        </button>
      )}
    </div>
  )
}

function Section({ title, items, onUpdate }) {
  return (
    <section style={{ marginBottom: '24px' }}>
      <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '10px' }}>
        {title} ({items.length})
      </div>
      {items.length === 0 ? (
        <p style={{ fontSize: '13px', color: T.textDim, paddingLeft: '2px' }}>None</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map(t => <TicketCard key={t.id} ticket={t} onUpdate={onUpdate} />)}
        </div>
      )}
    </section>
  )
}

export default function MaintenanceQueue() {
  const { user } = useAuth()
  const { tickets, loading, updateStatus } = useMaintenance(null, true)

  const open = tickets.filter(t => t.status === 'open')
  const inProgress = tickets.filter(t => t.status === 'in_progress')
  const resolved = tickets.filter(t => ['resolved', 'closed'].includes(t.status))

  function handleUpdate(id, next) {
    updateStatus(id, next, user.id)
  }

  return (
    <NavLayout>
      <div style={{ maxWidth: '640px', margin: '0 auto', fontFamily: font }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, marginBottom: '24px', letterSpacing: '0.3px' }}>
          Maintenance Queue
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
        ) : (
          <>
            <Section title='Open' items={open} onUpdate={handleUpdate} />
            <Section title='In Progress' items={inProgress} onUpdate={handleUpdate} />
            <Section title='Resolved / Closed' items={resolved} onUpdate={handleUpdate} />
          </>
        )}
      </div>
    </NavLayout>
  )
}
