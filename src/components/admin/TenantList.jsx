import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import NavLayout from '../shared/NavLayout'
import { supabase } from '../../lib/supabase'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

export default function TenantList() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, name, email, phone, unit_id, units(address, unit_number)')
          .order('name', { ascending: true })
        if (error) throw error
        setTenants(data)
      } catch {
        // non-fatal
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <NavLayout>
      <div style={{ maxWidth: '720px', margin: '0 auto', fontFamily: font }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, marginBottom: '24px', letterSpacing: '0.3px' }}>
          Tenants
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
        ) : tenants.length === 0 ? (
          <p style={{ fontSize: '13px', color: T.textDim }}>No tenants on record.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tenants.map(t => (
              <TenantRow key={t.id} tenant={t} />
            ))}
          </div>
        )}
      </div>
    </NavLayout>
  )
}

function TenantRow({ tenant: t }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={`/admin/tenants/${t.id}`}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: T.bgCard, borderRadius: '10px', padding: '14px 16px',
        border: `1px solid ${hovered ? T.terra : T.tanFaded}`,
        textDecoration: 'none',
        transition: 'all 200ms ease',
        boxShadow: hovered ? `0 4px 16px rgba(0,0,0,0.15)` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <p style={{ fontSize: '13px', fontWeight: 500, color: T.tan, margin: 0 }}>{t.name}</p>
        <p style={{ fontSize: '11px', color: T.textDim, marginTop: '3px', fontFamily: mono }}>
          {t.email}
        </p>
        {t.units && (
          <p style={{ fontSize: '11px', color: T.textDim, marginTop: '2px' }}>
            {t.units.address}{t.units.unit_number ? ` — Unit ${t.units.unit_number}` : ''}
          </p>
        )}
      </div>
      <svg
        width='16' height='16' viewBox='0 0 24 24' fill='none' stroke={hovered ? T.terra : T.textDim}
        strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'
        style={{ transition: 'stroke 200ms ease', flexShrink: 0 }}
      >
        <path d='M9 5l7 7-7 7' />
      </svg>
    </Link>
  )
}
