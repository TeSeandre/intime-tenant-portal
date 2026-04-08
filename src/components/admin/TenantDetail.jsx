import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import NavLayout from '../shared/NavLayout'
import MessageThread from '../shared/MessageThread'
import { useAuth } from '../../hooks/useAuth'
import { useLedger } from '../../hooks/useLedger'
import { supabase } from '../../lib/supabase'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"

function fmt(n) {
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TenantDetail() {
  const { tenantId } = useParams()
  const { user } = useAuth()
  const { charges, payments, balance, loading: ledgerLoading } = useLedger(tenantId)
  const [tenant, setTenant] = useState(null)
  const [unit, setUnit] = useState(null)
  const [lease, setLease] = useState(null)
  const [tickets, setTickets] = useState([])
  const [threadId, setThreadId] = useState(null)
  const [tab, setTab] = useState('ledger')

  useEffect(() => {
    if (!tenantId) return
    async function load() {
      try {
        const [tenantRes, leaseRes, maintenanceRes] = await Promise.all([
          supabase
            .from('tenants')
            .select('*, units(address, unit_number, rent_amount, status)')
            .eq('id', tenantId)
            .single(),
          supabase
            .from('leases')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from('maintenance')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false }),
        ])
        if (tenantRes.data) {
          setTenant(tenantRes.data)
          setUnit(tenantRes.data.units)
        }
        if (leaseRes.data) setLease(leaseRes.data)
        if (maintenanceRes.data) setTickets(maintenanceRes.data)

        if (user) {
          const [a, b] = [tenantId, user.id].sort()
          setThreadId(`${a}-${b}`)
        }
      } catch {
        // non-fatal
      }
    }
    load()
  }, [tenantId, user])

  const tabs = ['ledger', 'maintenance', 'lease', 'message']

  return (
    <NavLayout>
      <div style={{ maxWidth: '640px', margin: '0 auto', fontFamily: font }}>
        {/* Back link */}
        <Link to='/admin/tenants' style={{
          fontSize: '11px', color: T.textDim, textDecoration: 'none',
          display: 'block', marginBottom: '16px', letterSpacing: '0.3px',
          transition: 'color 200ms ease',
        }}
          onMouseEnter={e => e.target.style.color = T.terra}
          onMouseLeave={e => e.target.style.color = T.textDim}
        >
          ← Back to tenants
        </Link>

        {/* Tenant header */}
        {tenant && (
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 400, color: T.tan, margin: 0, letterSpacing: '0.3px' }}>
              {tenant.name}
            </h1>
            <p style={{ fontSize: '12px', color: T.textDim, marginTop: '4px', fontFamily: mono }}>
              {tenant.email} · {tenant.phone ?? '—'}
            </p>
            {unit && (
              <p style={{ fontSize: '11px', color: T.textDim, marginTop: '2px' }}>
                {unit.address}{unit.unit_number ? ` — Unit ${unit.unit_number}` : ''} · Rent: {fmt(unit.rent_amount)}
              </p>
            )}
          </div>
        )}

        {/* Balance banner */}
        {!ledgerLoading && (
          <div style={{
            borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
            background: balance > 0 ? T.terra : 'rgba(107,132,85,0.12)',
            border: balance > 0 ? 'none' : '1px solid rgba(107,132,85,0.3)',
          }}>
            <p style={{
              fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
              color: balance > 0 ? 'rgba(255,255,255,0.7)' : '#6B8455', margin: 0,
            }}>
              Current Balance
            </p>
            <p style={{
              fontSize: '28px', fontWeight: 300, fontFamily: mono,
              color: balance > 0 ? '#fff' : '#6B8455', margin: '4px 0 0',
            }}>
              {fmt(balance)}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '16px',
          borderBottom: `1px solid ${T.tanFaded}`,
        }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 14px', fontSize: '12px', fontWeight: 500,
                fontFamily: font, background: 'none', border: 'none', cursor: 'pointer',
                textTransform: 'capitalize', letterSpacing: '0.3px',
                borderBottom: tab === t ? `2px solid ${T.terra}` : '2px solid transparent',
                color: tab === t ? T.terra : T.textDim,
                transition: 'all 200ms ease',
                marginBottom: '-1px',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Ledger tab */}
        {tab === 'ledger' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', marginBottom: '4px' }}>
              Charges
            </div>
            {charges.map(c => (
              <div key={c.id} style={{
                background: T.bgCard, borderRadius: '8px', padding: '12px 14px',
                border: `1px solid ${T.tanFaded}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '13px', color: T.tan, textTransform: 'capitalize' }}>
                  {c.type.replace('_', ' ')} — {fmtDate(c.date)}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: T.terra, fontFamily: mono }}>
                  {fmt(c.amount)}
                </span>
              </div>
            ))}

            <div style={{ fontSize: '9px', letterSpacing: '2px', color: T.textDim, textTransform: 'uppercase', margin: '12px 0 4px' }}>
              Payments
            </div>
            {payments.map(p => (
              <div key={p.id} style={{
                background: T.bgCard, borderRadius: '8px', padding: '12px 14px',
                border: `1px solid ${T.tanFaded}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '13px', color: T.tan }}>
                  {fmtDate(p.paid_date ?? p.created_at)} — <span style={{ textTransform: 'capitalize' }}>{p.status}</span>
                </span>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B8455', fontFamily: mono }}>
                  {fmt(p.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Maintenance tab */}
        {tab === 'maintenance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tickets.length === 0 ? (
              <p style={{ fontSize: '13px', color: T.textDim }}>No maintenance tickets.</p>
            ) : tickets.map(t => (
              <div key={t.id} style={{
                background: T.bgCard, borderRadius: '10px', padding: '14px 16px',
                border: `1px solid ${T.tanFaded}`,
              }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: T.tan, margin: 0 }}>
                  {t.category} — {t.priority}
                </p>
                <p style={{ fontSize: '12px', color: T.textMid, marginTop: '4px' }}>{t.description}</p>
                <p style={{ fontSize: '10px', color: T.textDim, marginTop: '6px', fontFamily: mono }}>
                  {fmtDate(t.created_at)} · {t.status.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Lease tab */}
        {tab === 'lease' && (
          <div>
            {!lease ? (
              <p style={{ fontSize: '13px', color: T.textDim }}>No lease on file.</p>
            ) : (
              <div style={{
                background: T.bgCard, borderRadius: '12px', padding: '20px',
                border: `1px solid ${T.tanFaded}`,
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: T.textDim }}>Period: </span>
                  <span style={{ fontSize: '13px', color: T.tan }}>
                    {fmtDate(lease.start_date)} — {fmtDate(lease.end_date)}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: T.textDim }}>Signed: </span>
                  <span style={{ fontSize: '13px', color: lease.signed_at ? '#6B8455' : T.terra }}>
                    {lease.signed_at ? fmtDate(lease.signed_at) : 'Not yet signed'}
                  </span>
                </div>
                {lease.pdf_url && (
                  <a
                    href={lease.pdf_url}
                    target='_blank'
                    rel='noreferrer'
                    style={{ fontSize: '12px', color: T.terra, textDecoration: 'none', letterSpacing: '0.3px' }}
                  >
                    View Lease PDF →
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Message tab */}
        {tab === 'message' && threadId && (
          <div style={{
            background: T.bgCard, borderRadius: '12px',
            border: `1px solid ${T.tanFaded}`, overflow: 'hidden', height: '420px',
          }}>
            <MessageThread threadId={threadId} recipientId={tenantId} />
          </div>
        )}
      </div>
    </NavLayout>
  )
}
