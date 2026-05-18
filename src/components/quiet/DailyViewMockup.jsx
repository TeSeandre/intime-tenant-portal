import { THEMES } from '../../lib/theme'

const T = THEMES.warmEarth

const MESSAGES = [
  {
    id: 1,
    unit: 'Unit 2B',
    tenant: 'Marcus T.',
    text: "there's water coming through the ceiling in the bathroom",
    time: '8:14 AM',
    urgency: 'emergency',
    tag: '🔥 Emergency',
    tagColor: T.terra,
  },
  {
    id: 2,
    unit: 'Unit 1A',
    tenant: 'Keisha M.',
    text: "ac has been out since yesterday it's 84 degrees in here",
    time: '7:52 AM',
    urgency: 'urgent',
    tag: '⚡ Urgent',
    tagColor: '#D4913A',
  },
  {
    id: 3,
    unit: 'Unit 3C',
    tenant: 'Jordan L.',
    text: 'bathroom faucet is dripping [Ticket #127 created ✓]',
    time: 'Yesterday',
    urgency: 'normal',
    tag: '📋 Ticket open',
    tagColor: T.tan,
  },
  {
    id: 4,
    unit: 'Unit 2A',
    tenant: 'Priya S.',
    text: 'hey when is rent due this month? i thought it was the 1st',
    time: 'Yesterday',
    urgency: 'normal',
    tag: '💬 Rent',
    tagColor: T.tan,
  },
  {
    id: 5,
    unit: 'Unit 1B',
    tenant: 'Carlos R.',
    text: 'thanks for fixing the lock so fast! really appreciate it',
    time: '2 days ago',
    urgency: 'low',
    tag: '✅ FYI',
    tagColor: T.olive,
  },
]

function MessageRow({ msg, compact }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: compact ? 8 : 12,
        padding: compact ? '8px 10px' : '10px 14px',
        borderRadius: 8,
        background: T.bgHover,
        marginBottom: compact ? 4 : 6,
      }}
    >
      <div
        style={{
          width: compact ? 28 : 32,
          height: compact ? 28 : 32,
          borderRadius: '50%',
          background: T.bgCard,
          border: `1px solid rgba(196,168,130,0.15)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: compact ? 10 : 12,
          color: T.textMid,
          flexShrink: 0,
          fontWeight: 600,
        }}
      >
        {msg.tenant.split(' ').map(n => n[0]).join('')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
          <span style={{ fontSize: compact ? 10 : 12, fontWeight: 600, color: T.tan }}>{msg.tenant}</span>
          <span
            style={{
              fontSize: compact ? 9 : 10,
              background: T.bgCard,
              color: T.textDim,
              padding: '1px 6px',
              borderRadius: 4,
              border: `1px solid rgba(196,168,130,0.1)`,
            }}
          >
            {msg.unit}
          </span>
        </div>
        <div
          style={{
            fontSize: compact ? 10 : 12,
            color: T.textMid,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: compact ? 160 : '100%',
          }}
        >
          {msg.text}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: compact ? 9 : 10, color: T.textDim }}>{msg.time}</span>
        <span
          style={{
            fontSize: compact ? 8 : 10,
            color: msg.tagColor,
            background: `${msg.tagColor}18`,
            padding: compact ? '1px 5px' : '2px 7px',
            borderRadius: 4,
            whiteSpace: 'nowrap',
          }}
        >
          {msg.tag}
        </span>
      </div>
    </div>
  )
}

function SectionHeader({ emoji, label, count, color, compact }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: compact ? 4 : 8,
        marginTop: compact ? 8 : 12,
      }}
    >
      <span style={{ fontSize: compact ? 11 : 13 }}>{emoji}</span>
      <span style={{ fontSize: compact ? 10 : 12, fontWeight: 700, color, letterSpacing: '0.5px' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: compact ? 9 : 11,
          background: `${color}22`,
          color,
          padding: '1px 6px',
          borderRadius: 10,
          fontWeight: 600,
        }}
      >
        {count}
      </span>
    </div>
  )
}

export default function DailyViewMockup({ preview = false }) {
  const compact = preview

  const emergency = MESSAGES.filter(m => m.urgency === 'emergency' || m.urgency === 'urgent')
  const inbox = MESSAGES.filter(m => m.urgency === 'normal')
  const quiet = MESSAGES.filter(m => m.urgency === 'low')

  const previewEmergency = emergency.slice(0, 1)
  const previewInbox = inbox.slice(0, 1)
  const previewQuiet = quiet.slice(0, 1)

  const showEmergency = compact ? previewEmergency : emergency
  const showInbox = compact ? previewInbox : inbox
  const showQuiet = compact ? previewQuiet : quiet

  return (
    <div
      style={{
        background: T.bg,
        border: `1px solid rgba(196,168,130,0.12)`,
        borderRadius: compact ? 16 : 12,
        padding: compact ? '10px 10px 12px' : '16px',
        width: '100%',
        boxShadow: compact
          ? '0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)'
          : '0 4px 24px rgba(0,0,0,0.25)',
        fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: compact ? 8 : 12,
          paddingBottom: compact ? 8 : 10,
          borderBottom: `1px solid rgba(196,168,130,0.08)`,
        }}
      >
        <span style={{ fontSize: compact ? 11 : 14, fontWeight: 700, color: T.tan }}>Quiet</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <div style={{ width: compact ? 6 : 8, height: compact ? 6 : 8, borderRadius: '50%', background: T.olive }} />
          <span style={{ fontSize: compact ? 9 : 11, color: T.textDim }}>4 units live</span>
        </div>
      </div>

      {/* Emergency section */}
      {showEmergency.length > 0 && (
        <>
          <SectionHeader
            emoji="🔥"
            label="Needs you now"
            count={compact ? previewEmergency.length : emergency.length}
            color={T.terra}
            compact={compact}
          />
          {showEmergency.map(m => <MessageRow key={m.id} msg={m} compact={compact} />)}
        </>
      )}

      {/* Inbox section */}
      {showInbox.length > 0 && (
        <>
          <SectionHeader
            emoji="📬"
            label="Inbox"
            count={compact ? previewInbox.length : inbox.length}
            color={T.tan}
            compact={compact}
          />
          {showInbox.map(m => <MessageRow key={m.id} msg={m} compact={compact} />)}
        </>
      )}

      {/* Quiet section */}
      {showQuiet.length > 0 && (
        <>
          <SectionHeader
            emoji="✅"
            label="Quiet"
            count={compact ? previewQuiet.length : quiet.length}
            color={T.olive}
            compact={compact}
          />
          {showQuiet.map(m => <MessageRow key={m.id} msg={m} compact={compact} />)}
        </>
      )}

      {/* Empty state hint (full mode only) */}
      {!compact && (
        <div
          style={{
            textAlign: 'center',
            marginTop: 16,
            padding: '10px',
            borderTop: `1px solid rgba(196,168,130,0.06)`,
            fontSize: 11,
            color: T.textDim,
          }}
        >
          All quiet across your 4 units. Tenants are happy.
        </div>
      )}
    </div>
  )
}
