import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import NavLayout from '../shared/NavLayout'
import { useAuth } from '../../hooks/useAuth'
import { useLedger } from '../../hooks/useLedger'
import { supabase } from '../../lib/supabase'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

function AnimCounter({ target, prefix = '', suffix = '', duration = 1400, color }) {
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
    if (!started || target === null || target === undefined) return
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
      fontSize: '28px', fontWeight: 300, color: color || T.tan,
      fontFamily: mono, lineHeight: 1,
      opacity: started ? 1 : 0,
      transform: started ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 500ms ease, transform 500ms ease',
    }}>
      {prefix}{val.toLocaleString()}{suffix}
    </div>
  )
}

function StatCard({ label, sub, color, children, delay = 0 }) {
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
      background: T.bgCard, borderRadius: '12px', padding: '18px',
      border: `1px solid ${T.tanFaded}`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: `all 500ms ease ${delay}ms`,
      display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase' }}>
        {label}
      </div>
      {children}
      {sub && <div style={{ fontSize: '10px', color: T.textDim }}>{sub}</div>}
    </div>
  )
}

export default function TenantDashboard() {
  const { user, profile } = useAuth()
  const { balance, loading: ledgerLoading } = useLedger(user?.id)
  const [unit, setUnit] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [openTickets, setOpenTickets] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [tenantRes, announcementsRes, maintenanceRes] = await Promise.all([
          supabase
            .from('tenants')
            .select('unit_id, units(address, unit_number, rent_amount)')
            .eq('id', user.id)
            .single(),
          supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('maintenance')
            .select('id', { count: 'exact' })
            .eq('tenant_id', user.id)
            .in('status', ['open', 'in_progress']),
        ])
        if (tenantRes.data?.units) setUnit(tenantRes.data.units)
        if (announcementsRes.data) setAnnouncements(announcementsRes.data)
        if (maintenanceRes.count != null) setOpenTickets(maintenanceRes.count)
        setDataLoaded(true)
      } catch {
        setDataLoaded(true)
      }
    }
    load()
  }, [user])

  const fmt = n => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })

  return (
    <NavLayout>
      <div style={{ maxWidth: '640px', margin: '0 auto', fontFamily: font }}>
        {/* Greeting */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, letterSpacing: '0.3px', margin: 0 }}>
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          {unit && (
            <p style={{ fontSize: '12px', color: T.textDim, marginTop: '4px', letterSpacing: '0.5px' }}>
              {unit.address}{unit.unit_number ? ` — Unit ${unit.unit_number}` : ''}
            </p>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          <StatCard label="Balance Due" color={balance > 0 ? T.terra : T.olive} delay={0}>
            {!ledgerLoading && dataLoaded ? (
              <AnimCounter
                target={Math.round(balance)}
                prefix="$"
                color={balance > 0 ? T.terra : T.olive}
                duration={1200}
              />
            ) : (
              <div style={{ fontSize: '28px', color: T.textDim, fontFamily: mono }}>—</div>
            )}
          </StatCard>

          <StatCard label="Monthly Rent" sub="per month" delay={80}>
            {unit ? (
              <AnimCounter
                target={Math.round(unit.rent_amount)}
                prefix="$"
                color={T.tan}
                duration={1300}
              />
            ) : (
              <div style={{ fontSize: '28px', color: T.textDim, fontFamily: mono }}>—</div>
            )}
          </StatCard>

          <StatCard label="Open Tickets" color={openTickets > 0 ? T.terra : T.olive} delay={160}>
            {dataLoaded ? (
              <AnimCounter target={openTickets} color={openTickets > 0 ? T.terra : T.olive} duration={1000} />
            ) : (
              <div style={{ fontSize: '28px', color: T.textDim, fontFamily: mono }}>—</div>
            )}
          </StatCard>

          <StatCard label="Account Status" delay={240}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '20px', marginTop: '4px',
              background: T.oliveFaded, border: `1px solid ${T.oliveGlow}`,
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: T.olive }} />
              <span style={{ fontSize: '12px', color: T.olive, fontWeight: 500 }}>Active</span>
            </div>
          </StatCard>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
          <Link to='/tenant/payments' style={{
            background: T.terra, color: '#fff', borderRadius: '10px', padding: '14px',
            fontSize: '13px', fontWeight: 500, textAlign: 'center', textDecoration: 'none',
            letterSpacing: '0.3px', transition: 'all 200ms ease',
            boxShadow: `0 4px 16px ${T.terraGlow}`,
            fontFamily: font,
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Pay Rent
          </Link>
          <Link to='/tenant/maintenance' style={{
            background: T.bgCard, color: T.tan, borderRadius: '10px', padding: '14px',
            fontSize: '13px', fontWeight: 500, textAlign: 'center', textDecoration: 'none',
            letterSpacing: '0.3px', border: `1px solid ${T.tanGhost}`,
            transition: 'all 200ms ease', fontFamily: font,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.terra; e.currentTarget.style.color = T.terra }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.tanGhost; e.currentTarget.style.color = T.tan }}
          >
            Submit Request
          </Link>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <section>
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '12px' }}>
              Announcements
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {announcements.map(a => (
                <div key={a.id} style={{
                  background: T.bgCard, borderRadius: '10px', padding: '14px 16px',
                  border: `1px solid ${T.tanFaded}`,
                }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: T.tan, margin: 0 }}>{a.title}</p>
                  <p style={{ fontSize: '12px', color: T.textMid, marginTop: '4px', lineHeight: 1.5 }}>{a.body}</p>
                  <p style={{ fontSize: '10px', color: T.textDim, marginTop: '8px', fontFamily: mono }}>
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </NavLayout>
  )
}
