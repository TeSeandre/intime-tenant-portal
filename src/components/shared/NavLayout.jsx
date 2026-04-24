import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useEffect, useRef, useState } from 'react'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"

const tenantLinks = [
  { to: '/tenant/dashboard', label: 'Dashboard' },
  { to: '/tenant/payments', label: 'Pay Rent' },
  { to: '/tenant/payment-history', label: 'History' },
  { to: '/tenant/lease', label: 'Lease' },
  { to: '/tenant/maintenance', label: 'Maintenance' },
  { to: '/tenant/inbox', label: 'Inbox' },
  { to: '/tenant/profile', label: 'Profile' },
  { to: '/tenant/review', label: 'Review' },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/tenants', label: 'Tenants' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/maintenance', label: 'Maintenance' },
  { to: '/admin/announcements', label: 'Announcements' },
]

export default function NavLayout({ children }) {
  const { isAdmin, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const links = isAdmin ? adminLinks : tenantLinks
  const visibleLinks = links.slice(0, 5)

  const tabRefs = useRef([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const activeIdx = visibleLinks.findIndex(l => location.pathname === l.to)
    if (activeIdx >= 0 && tabRefs.current[activeIdx]) {
      const el = tabRefs.current[activeIdx]
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
  }, [location.pathname])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: T.bg, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        .nav-mobile { display: flex; }
        .nav-sidebar { display: none; }
        .main-content { padding: 20px 16px 100px; }
        @media (min-width: 640px) {
          .nav-mobile { display: none !important; }
          .nav-sidebar { display: flex !important; }
          .main-content { padding: 32px; }
        }
      `}</style>

      {/* Header */}
      <header style={{
        background: T.bgCard, padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${T.tanFaded}`,
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '0.5px' }}>
          <span style={{ color: T.tan }}>InTime</span>
          <span style={{ color: T.terra }}> Realty</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: T.textDim, letterSpacing: '0.3px' }}>
            {profile?.full_name ?? ''}
          </span>
          <button
            onClick={handleSignOut}
            style={{
              fontSize: '11px', color: T.textMid, background: 'none', border: `1px solid ${T.tanFaded}`,
              cursor: 'pointer', fontFamily: font, letterSpacing: '1px', textTransform: 'uppercase',
              padding: '5px 12px', borderRadius: '6px', transition: 'all 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.terra; e.currentTarget.style.color = T.terra }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.tanFaded; e.currentTarget.style.color = T.textMid }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="nav-mobile" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: T.bgCard, borderTop: `1px solid ${T.tanFaded}`,
        padding: '4px', gap: '2px',
      }}>
        {/* Sliding indicator */}
        <div style={{
          position: 'absolute', top: '4px', bottom: '4px',
          left: `${indicator.left}px`, width: `${indicator.width}px`,
          background: `linear-gradient(135deg, ${T.terraFaded}, ${T.terraGlow})`,
          borderRadius: '8px', border: `1px solid ${T.terra}`,
          transition: 'all 350ms cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: `0 0 16px ${T.terraGlow}`,
          pointerEvents: 'none',
        }} />
        {visibleLinks.map((link, i) => (
          <div key={link.to} ref={el => tabRefs.current[i] = el} style={{ flex: 1 }}>
            <NavLink
              to={link.to}
              style={({ isActive }) => ({
                display: 'block', padding: '10px 4px', textAlign: 'center',
                fontSize: '10px', letterSpacing: '0.5px', fontFamily: font,
                color: isActive ? T.tan : T.textDim,
                fontWeight: isActive ? 500 : 400,
                textDecoration: 'none', position: 'relative', zIndex: 1,
                transition: 'color 300ms ease',
              })}
            >
              {link.label}
            </NavLink>
          </div>
        ))}
      </nav>

      {/* Desktop layout */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside className="nav-sidebar" style={{
          width: '200px', background: T.bgCard,
          borderRight: `1px solid ${T.tanFaded}`,
          padding: '24px 12px', flexDirection: 'column', gap: '2px',
          position: 'sticky', top: '53px', height: 'calc(100vh - 53px)',
          overflowY: 'auto',
        }}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'block', padding: '10px 14px', borderRadius: '8px',
                fontSize: '13px', fontFamily: font, textDecoration: 'none',
                transition: 'all 200ms ease',
                background: isActive ? T.terraFaded : 'transparent',
                color: isActive ? T.terra : T.textMid,
                borderLeft: `2px solid ${isActive ? T.terra : 'transparent'}`,
                fontWeight: isActive ? 500 : 400,
                letterSpacing: '0.3px',
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </aside>

        {/* Main content */}
        <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
