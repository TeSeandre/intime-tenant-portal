import { THEMES } from '../../lib/theme'

const T = THEMES.warmEarth

const mockMessages = [
  { id: 1, unit: 'Unit 2B', tenant: 'Marcus T.', text: "there's water coming through the ceiling in the bathroom", time: '8:14 AM', urgency: 'emergency', category: 'plumbing', aiTag: '🔥 Emergency' },
  { id: 2, unit: 'Unit 1A', tenant: 'Keisha M.', text: "ac has been out since yesterday it's 84 degrees in here", time: '7:52 AM', urgency: 'urgent', category: 'hvac', aiTag: '⚡ Urgent' },
  { id: 3, unit: 'Unit 3C', tenant: 'Jordan L.', text: 'bathroom faucet is dripping [Ticket #127 created ✓]', time: 'Yesterday', urgency: 'normal', category: 'plumbing', aiTag: '📋 Ticket open' },
  { id: 4, unit: 'Unit 2A', tenant: 'Priya S.', text: 'hey when is rent due this month? i thought it was the 1st', time: 'Yesterday', urgency: 'normal', category: 'rent', aiTag: '💬 Rent' },
  { id: 5, unit: 'Unit 1B', tenant: 'Carlos R.', text: 'thanks for fixing the lock so fast! really appreciate it', time: '2 days ago', urgency: 'low', category: 'general', aiTag: '✅ FYI' },
]

function MessageRow({ msg, compact }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: compact ? 8 : 12,
      padding: compact ? '8px 12px' : '10px 16px',
      borderBottom: `1px solid rgba(196,168,130,0.06)`,
    }}>
      <span style={{
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: 100,
        background: T.bgHover,
        color: T.textMid,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        {msg.unit}
      </span>
      <span style={{ color: T.tan, fontSize: compact ? 12 : 13, fontWeight: 500, flexShrink: 0, minWidth: compact ? 72 : 80 }}>
        {msg.tenant}
      </span>
      <span style={{ color: T.textMid, fontSize: compact ? 11 : 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {msg.text}
      </span>
      <span style={{ color: T.textDim, fontSize: 11, flexShrink: 0, whiteSpace: 'nowrap' }}>{msg.time}</span>
      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: T.bgHover, color: T.textMid, whiteSpace: 'nowrap', flexShrink: 0 }}>
        {msg.aiTag}
      </span>
    </div>
  )
}

function SectionHeader({ label, color, count, compact }) {
  return (
    <div style={{
      padding: compact ? '8px 12px 4px' : '12px 16px 6px',
      fontSize: compact ? 11 : 12,
      fontWeight: 600,
      color,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      borderBottom: `1px solid rgba(196,168,130,0.08)`,
    }}>
      {label} ({count})
    </div>
  )
}

export default function DailyViewMockup({ preview = false }) {
  const emergency = mockMessages.filter(m => m.urgency === 'emergency' || m.urgency === 'urgent')
  const inbox = mockMessages.filter(m => m.urgency === 'normal')
  const quiet = mockMessages.filter(m => m.urgency === 'low')

  const previewEmergency = [mockMessages[0]]
  const previewInbox = [mockMessages[2]]
  const previewQuiet = [mockMessages[4]]

  const containerStyle = preview
    ? {
        maxWidth: 400,
        margin: '0 auto',
        background: T.bgCard,
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid rgba(196,168,130,0.12)`,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }
    : {
        maxWidth: 640,
        margin: '0 auto',
        background: T.bgCard,
        borderRadius: 12,
        overflow: 'hidden',
        border: `1px solid rgba(196,168,130,0.12)`,
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }

  const chromePillStyle = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'rgba(196,168,130,0.15)',
  }

  return (
    <div style={containerStyle}>
      {/* Browser chrome */}
      <div style={{
        background: T.bg,
        padding: preview ? '8px 12px' : '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        borderBottom: `1px solid rgba(196,168,130,0.08)`,
      }}>
        <div style={chromePillStyle} />
        <div style={chromePillStyle} />
        <div style={chromePillStyle} />
        <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: T.textDim }}>
          quiet.app — Daily View
        </div>
      </div>

      {/* Header */}
      <div style={{
        padding: preview ? '10px 12px' : '14px 16px',
        borderBottom: `1px solid rgba(196,168,130,0.08)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: T.tan, fontWeight: 600, fontSize: preview ? 13 : 15 }}>Quiet</span>
        <span style={{ color: T.textDim, fontSize: 11 }}>Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>

      {/* Content */}
      {preview ? (
        <>
          <SectionHeader label="🔥 Needs you now" color={T.terra} count={1} compact />
          {previewEmergency.map(m => <MessageRow key={m.id} msg={m} compact />)}
          <SectionHeader label="📬 Inbox" color={T.tan} count={1} compact />
          {previewInbox.map(m => <MessageRow key={m.id} msg={m} compact />)}
          <SectionHeader label="✅ Quiet" color={T.olive} count={1} compact />
          {previewQuiet.map(m => <MessageRow key={m.id} msg={m} compact />)}
        </>
      ) : (
        <>
          <SectionHeader label="🔥 Needs you now" color={T.terra} count={emergency.length} compact={false} />
          {emergency.map(m => <MessageRow key={m.id} msg={m} compact={false} />)}
          <SectionHeader label="📬 Inbox" color={T.tan} count={inbox.length} compact={false} />
          {inbox.map(m => <MessageRow key={m.id} msg={m} compact={false} />)}
          <SectionHeader label="✅ Quiet" color={T.olive} count={quiet.length} compact={false} />
          {quiet.map(m => <MessageRow key={m.id} msg={m} compact={false} />)}
        </>
      )}
    </div>
  )
}
