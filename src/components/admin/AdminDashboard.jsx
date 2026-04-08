import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import NavLayout from '../shared/NavLayout'
import { supabase } from '../../lib/supabase'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

function AnimCounter({ target, duration = 1200, color }) {
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
      fontSize: '32px', fontWeight: 300, color: color || T.tan,
      fontFamily: mono, lineHeight: 1,
      opacity: started ? 1 : 0,
      transform: started ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 500ms ease, transform 500ms ease',
    }}>
      {typeof target === 'number' ? val : '—'}
    </div>
  )
}

function StatCard({ label, value, to, accent, delay = 0 }) {
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

  const color = accent ? T.terra : T.tan

  const card = (
    <div ref={ref} style={{
      background: T.bgCard, borderRadius: '12px', padding: '20px',
      border: `1px solid ${hovered && to ? T.terra : T.tanFaded}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: `all 500ms ease ${delay}ms, border-color 200ms ease`,
      cursor: to ? 'pointer' : 'default',
      boxShadow: hovered && to ? `0 8px 24px rgba(0,0,0,0.2), 0 0 0 1px ${T.terraGlow}` : 'none',
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '10px' }}>
        {label}
      </div>
      <AnimCounter target={typeof value === 'number' ? value : null} color={color} duration={1200 + delay} />
      {to && hovered && (
        <div style={{ fontSize: '10px', color: T.terra, marginTop: '8px', letterSpacing: '0.5px' }}>
          View →
        </div>
      )}
    </div>
  )

  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{card}</Link> : card
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTenants: null,
    pendingPayments: null,
    openTickets: null,
    vacantUnits: null,
  })

  useEffect(() => {
    async function load() {
      try {
        const [tenantsRes, paymentsRes, maintenanceRes, unitsRes] = await Promise.all([
          supabase.from('tenants').select('id', { count: 'exact', head: true }),
          supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('maintenance').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
          supabase.from('units').select('id', { count: 'exact', head: true }).eq('status', 'vacant'),
        ])
        setStats({
          totalTenants: tenantsRes.count ?? 0,
          pendingPayments: paymentsRes.count ?? 0,
          openTickets: maintenanceRes.count ?? 0,
          vacantUnits: unitsRes.count ?? 0,
        })
      } catch {
        // non-fatal
      }
    }
    load()
  }, [])

  return (
    <NavLayout>
      <div style={{ maxWidth: '700px', margin: '0 auto', fontFamily: font }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, marginBottom: '24px', letterSpacing: '0.3px' }}>
          Admin Dashboard
        </h1>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          <StatCard label="Total Tenants" value={stats.totalTenants} to='/admin/tenants' delay={0} />
          <StatCard label="Pending Payments" value={stats.pendingPayments} to='/admin/payments' accent={stats.pendingPayments > 0} delay={80} />
          <StatCard label="Open Tickets" value={stats.openTickets} to='/admin/maintenance' accent={stats.openTickets > 0} delay={160} />
          <StatCard label="Vacant Units" value={stats.vacantUnits} delay={240} />
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { to: '/admin/payments', label: 'Review Payments', primary: true },
            { to: '/admin/maintenance', label: 'Maintenance Queue', secondary: true },
            { to: '/admin/announcements', label: 'Announcements' },
            { to: '/admin/tenants', label: 'Tenant List' },
          ].map(({ to, label, primary, secondary }) => (
            <Link key={to} to={to} style={{
              display: 'block', padding: '14px', borderRadius: '10px', textAlign: 'center',
              fontSize: '13px', fontWeight: 500, textDecoration: 'none', fontFamily: font,
              letterSpacing: '0.3px', transition: 'all 200ms ease',
              background: primary ? T.terra : secondary ? T.bgHover : T.bgCard,
              color: primary ? '#fff' : T.tan,
              border: `1px solid ${primary ? 'transparent' : T.tanGhost}`,
              boxShadow: primary ? `0 4px 16px ${T.terraGlow}` : 'none',
            }}
              onMouseEnter={e => { if (!primary) { e.currentTarget.style.borderColor = T.terra; e.currentTarget.style.color = T.terra } else { e.currentTarget.style.opacity = '0.85' } }}
              onMouseLeave={e => { if (!primary) { e.currentTarget.style.borderColor = T.tanGhost; e.currentTarget.style.color = T.tan } else { e.currentTarget.style.opacity = '1' } }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </NavLayout>
  )
}
