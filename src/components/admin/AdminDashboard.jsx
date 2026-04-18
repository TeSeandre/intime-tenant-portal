import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import NavLayout from '../shared/NavLayout'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import T from '../../lib/theme'

const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

function AnimCounter({ target, prefix = '', suffix = '', duration = 1200, color }) {
  const [val, setVal] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect() }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started || typeof target !== 'number') return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration])

  return (
    <div ref={ref} style={{
      fontSize: '34px', fontWeight: 300,
      color: color || T.tan, fontFamily: mono, lineHeight: 1,
      opacity: started ? 1 : 0,
      transform: started ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 500ms ease, transform 500ms ease',
    }}>
      {typeof target === 'number' ? `${prefix}${val.toLocaleString()}${suffix}` : '—'}
    </div>
  )
}

function StatCard({ label, value, to, accent, warning, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const accentColor = warning ? T.terra : accent ? T.terra : T.tan
  const glowColor = warning ? T.terraGlow : T.oliveGlow

  const card = (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.bgCard, borderRadius: '12px', padding: '20px',
        border: `1px solid ${hovered && to ? T.terra : warning && value > 0 ? T.terra : T.tanFaded}`,
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered && to ? 'translateY(-2px)' : 'translateY(0)'
          : 'translateY(14px)',
        transition: `all 500ms ease ${delay}ms, border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease`,
        cursor: to ? 'pointer' : 'default',
        boxShadow: hovered && to
          ? `0 12px 32px rgba(0,0,0,0.25), 0 0 0 1px ${T.terraGlow}`
          : warning && value > 0
          ? `0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 ${T.terraFaded}`
          : `0 4px 12px rgba(0,0,0,0.1)`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Corner glow on hover */}
      <div style={{
        position: 'absolute', top: '-30px', right: '-30px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 400ms ease',
        pointerEvents: 'none',
      }} />

      <div style={{
        fontSize: '9px', letterSpacing: '2px', color: T.textDim,
        textTransform: 'uppercase', marginBottom: '12px', fontFamily: font,
      }}>
        {label}
      </div>

      <AnimCounter
        target={typeof value === 'number' ? value : null}
        color={accentColor}
        duration={1200 + delay}
      />

      {warning && value > 0 && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          marginTop: '8px', padding: '3px 8px', borderRadius: '12px',
          background: T.terraFaded, border: `1px solid ${T.terraGlow}`,
          fontSize: '9px', letterSpacing: '1px', color: T.terra,
          textTransform: 'uppercase', fontWeight: 500,
        }}>
          Needs review
        </div>
      )}

      {to && hovered && (
        <div style={{
          fontSize: '10px', color: T.terra, marginTop: '10px',
          letterSpacing: '0.5px', fontFamily: font,
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          View all →
        </div>
      )}
    </div>
  )

  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{card}</Link> : card
}

function ActionButton({ to, label, primary, warning }) {
  const [hovered, setHovered] = useState(false)

  const bg = primary
    ? hovered ? T.terra : T.terra
    : warning
    ? hovered ? T.bgHover : T.bgCard
    : hovered ? T.bgHover : T.bgCard

  const borderColor = primary
    ? 'transparent'
    : hovered
    ? (warning ? T.terra : T.terra)
    : (warning ? T.terra : T.tanGhost)

  const color = primary ? '#fff' : hovered ? T.terra : warning ? T.terra : T.tan

  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderRadius: '10px', cursor: 'pointer',
          background: bg, color,
          border: `1px solid ${borderColor}`,
          fontFamily: font, fontSize: '13px', fontWeight: 500,
          letterSpacing: '0.3px',
          boxShadow: primary
            ? hovered ? `0 6px 20px ${T.terraGlow}` : `0 4px 14px ${T.terraGlow}`
            : 'none',
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
          transition: 'all 200ms cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Shimmer on primary hover */}
        {primary && hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)`,
            animation: 'adminShimmer 1s ease infinite',
            pointerEvents: 'none',
          }} />
        )}
        <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
        <span style={{
          fontSize: '14px', opacity: hovered ? 1 : 0.4,
          transition: 'opacity 200ms ease, transform 200ms ease',
          transform: hovered ? 'translateX(3px)' : 'translateX(0)',
        }}>→</span>
      </div>
    </Link>
  )
}

function AttentionItem({ icon, text, sub, to, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const inner = (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px', borderRadius: '10px',
        background: hovered ? T.bgHover : T.bgCard,
        border: `1px solid ${hovered ? T.tanGhost : T.tanFaded}`,
        cursor: to ? 'pointer' : 'default',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-12px)',
        transition: `all 450ms ease ${delay}ms, background 150ms ease, border-color 150ms ease`,
      }}
    >
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: T.terraFaded, border: `1px solid ${T.terraGlow}`,
        fontSize: '14px',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', color: T.tan, fontFamily: font, fontWeight: 500 }}>{text}</div>
        {sub && <div style={{ fontSize: '11px', color: T.textDim, marginTop: '2px', fontFamily: mono }}>{sub}</div>}
      </div>
      {to && (
        <span style={{
          fontSize: '12px', color: T.terra, opacity: hovered ? 1 : 0,
          transition: 'opacity 200ms ease, transform 200ms ease',
          transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
        }}>→</span>
      )}
    </div>
  )

  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner
}

function SectionHeader({ label, title, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{
      marginBottom: '16px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: `all 400ms ease ${delay}ms`,
    }}>
      <div style={{
        fontSize: '9px', letterSpacing: '3px', color: T.textDim,
        textTransform: 'uppercase', marginBottom: '4px', fontFamily: font,
      }}>
        {label}
      </div>
      <h2 style={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: '18px', fontWeight: 400, color: T.tan, margin: 0,
      }}>
        {title}
      </h2>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalTenants: null,
    pendingPayments: null,
    openTickets: null,
    vacantUnits: null,
  })
  const [recentPayments, setRecentPayments] = useState([])
  const [recentTickets, setRecentTickets] = useState([])
  const [headerVisible, setHeaderVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [tenantsRes, paymentsRes, maintenanceRes, unitsRes, recentPay, recentTix] = await Promise.all([
          supabase.from('tenants').select('id', { count: 'exact', head: true }),
          supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('maintenance').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
          supabase.from('units').select('id', { count: 'exact', head: true }).eq('status', 'vacant'),
          supabase.from('payments').select('amount, status, created_at, tenants(user_id)').eq('status', 'pending').order('created_at', { ascending: false }).limit(3),
          supabase.from('maintenance').select('description, priority, created_at').in('status', ['open', 'in_progress']).order('created_at', { ascending: false }).limit(3),
        ])
        setStats({
          totalTenants: tenantsRes.count ?? 0,
          pendingPayments: paymentsRes.count ?? 0,
          openTickets: maintenanceRes.count ?? 0,
          vacantUnits: unitsRes.count ?? 0,
        })
        setRecentPayments(recentPay.data ?? [])
        setRecentTickets(recentTix.data ?? [])
      } catch {
        // non-fatal
      }
    }
    load()
  }, [])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Admin'
  const hasAttention = (stats.pendingPayments > 0) || (stats.openTickets > 0)

  return (
    <NavLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@400;500&display=swap');
        @keyframes adminShimmer {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(220%) skewX(-15deg); }
        }
      `}</style>

      <div style={{ maxWidth: '740px', margin: '0 auto', fontFamily: font }}>

        {/* Page header */}
        <div style={{
          marginBottom: '32px',
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 500ms ease',
        }}>
          <div style={{
            fontSize: '10px', letterSpacing: '3px', color: T.textDim,
            textTransform: 'uppercase', marginBottom: '6px', fontFamily: font,
          }}>
            {greeting()}
          </div>
          <h1 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '26px', fontWeight: 400, color: T.tan, margin: 0,
          }}>
            {firstName}
          </h1>
          <p style={{
            fontSize: '13px', color: T.textMid, marginTop: '6px',
            fontFamily: font, fontWeight: 300,
          }}>
            Here's what's happening across your properties today.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ marginBottom: '32px' }}>
          <SectionHeader label="Overview" title="Property Snapshot" delay={100} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <StatCard label="Total Tenants" value={stats.totalTenants} to='/admin/tenants' delay={0} />
            <StatCard
              label="Pending Payments" value={stats.pendingPayments}
              to='/admin/payments' warning={stats.pendingPayments > 0} delay={80}
            />
            <StatCard
              label="Open Tickets" value={stats.openTickets}
              to='/admin/maintenance' warning={stats.openTickets > 0} delay={160}
            />
            <StatCard label="Vacant Units" value={stats.vacantUnits} delay={240} />
          </div>
        </div>

        {/* Needs Attention — only shown if there's something actionable */}
        {hasAttention && (
          <div style={{ marginBottom: '32px' }}>
            <SectionHeader label="Action Required" title="Needs Your Attention" delay={200} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.pendingPayments > 0 && (
                <AttentionItem
                  icon="$"
                  text={`${stats.pendingPayments} payment${stats.pendingPayments > 1 ? 's' : ''} awaiting confirmation`}
                  sub="Tenant submitted — pending your review"
                  to="/admin/payments"
                  delay={0}
                />
              )}
              {stats.openTickets > 0 && (
                <AttentionItem
                  icon="🔧"
                  text={`${stats.openTickets} maintenance ticket${stats.openTickets > 1 ? 's' : ''} open`}
                  sub="Unresolved work orders across properties"
                  to="/admin/maintenance"
                  delay={80}
                />
              )}
              {recentPayments.slice(0, 2).map((p, i) => (
                <AttentionItem
                  key={i}
                  icon="↑"
                  text={`$${Number(p.amount).toLocaleString()} — pending confirmation`}
                  sub={new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  to="/admin/payments"
                  delay={160 + i * 60}
                />
              ))}
              {recentTickets.slice(0, 2).map((t, i) => (
                <AttentionItem
                  key={i}
                  icon="•"
                  text={t.description?.slice(0, 52) + (t.description?.length > 52 ? '…' : '')}
                  sub={`Priority: ${t.priority ?? 'standard'} · ${new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  to="/admin/maintenance"
                  delay={280 + i * 60}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ marginBottom: '16px' }}>
          <SectionHeader label="Navigation" title="Quick Actions" delay={300} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <ActionButton to='/admin/payments' label='Review Payments' primary />
            <ActionButton to='/admin/maintenance' label='Maintenance Queue' warning={stats.openTickets > 0} />
            <ActionButton to='/admin/announcements' label='Announcements' />
            <ActionButton to='/admin/tenants' label='Tenant List' />
          </div>
        </div>

      </div>
    </NavLayout>
  )
}
