import { useState } from 'react'
import { Link } from 'react-router-dom'
import { THEMES } from '../lib/theme'
import { supabase } from '../lib/supabase'
import DailyViewMockup from './quiet/DailyViewMockup'

const T = THEMES.warmEarth

const CHECKLIST = [
  '✓ SMS inbound triage',
  '✓ AI-structured maintenance tickets',
  '✓ One-tap reply with AI draft',
  '✓ Emergency escalation (instant push)',
  '✓ Full thread history per unit',
  '✓ Direct line to the founder',
  '✓ Your feature requests shape V2',
]

const NOT_LIST = [
  'Not property management software',
  'Not a tenant portal',
  'Not accounting / bookkeeping',
  'Not a listing or screening tool',
  'Not a payment processor',
  'Not an autonomous AI agent',
  'Not built for property managers',
  'Not another dashboard full of charts',
]

const FAQS = [
  { q: 'When does V1 launch?', a: "60 days from hitting 5 pre-orders. I'll email you when we go live — typically late summer 2026." },
  { q: "What if it doesn't ship?", a: "Full refund. Your card is charged immediately, but if V1 doesn't launch within 60 days of your pre-order, you get every dollar back, no questions." },
  { q: 'Does my tenant see any AI?', a: 'No. In V1, Quiet only assists you. Every outbound message requires your approval before it sends. Tenants never interact with the AI.' },
  { q: "Do I need to change my tenant's contact info?", a: "You get a dedicated phone number. You can forward your existing number's texts or give tenants the new number directly. Either works." },
  { q: 'What carriers/phones work?', a: "Any SMS-capable phone number in the US. Your tenants don't need to install anything." },
  { q: 'How many doors can I have?', a: 'Pre-order locks you in at $19/mo for up to 25 doors — forever, even when standard pricing starts at $49/mo.' },
  { q: 'Is my data secure?', a: "Yes. All data is encrypted at rest and in transit. Row-level security means your data is yours only. We don't sell or share tenant data." },
  { q: 'What\'s your refund policy after launch?', a: "30-day satisfaction guarantee. If it doesn't work for you in the first 30 days post-launch, full refund." },
]

function handlePreorder() {
  const url = import.meta.env.VITE_STRIPE_PREORDER_URL
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' })
  }
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        background: T.bgCard,
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid rgba(196,168,130,0.1)`,
        borderLeft: open ? `3px solid ${T.terra}` : `3px solid transparent`,
        transition: 'border-color 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: T.tan,
          fontSize: 15,
          fontWeight: 500,
          textAlign: 'left',
          gap: 12,
        }}
      >
        <span>{q}</span>
        <span style={{ color: T.textDim, flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 16px', color: T.textMid, fontSize: 14, lineHeight: 1.6 }}>
          {a}
        </div>
      )}
    </div>
  )
}

function PainCard({ children }) {
  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid rgba(196,168,130,0.1)`,
      borderRadius: 12,
      padding: 16,
      flex: '1 1 220px',
    }}>
      {children}
    </div>
  )
}

function ValueCard({ icon, title, desc }) {
  return (
    <div style={{
      background: T.bgCard,
      border: `1px solid rgba(196,168,130,0.1)`,
      borderRadius: 12,
      padding: 24,
      flex: '1 1 220px',
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ width: 32, height: 2, background: T.terra, borderRadius: 1, marginBottom: 12 }} />
      <div style={{ color: T.tan, fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{title}</div>
      <div style={{ color: T.textMid, fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
    </div>
  )
}

export default function QuietLandingPage() {
  const [email, setEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleWaitlist(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    const { error } = await supabase.from('contact_inquiries').insert({ email: email.trim(), name: '' })
    if (!error) {
      setWaitlistStatus('success')
    } else if (error.code === '23505') {
      setWaitlistStatus('duplicate')
    } else {
      setWaitlistStatus('error')
    }
    setSubmitting(false)
  }

  const inputStyle = {
    background: T.bgCard,
    color: T.tan,
    border: `1px solid rgba(196,168,130,0.2)`,
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 15,
    outline: 'none',
    flex: '1 1 200px',
    fontFamily: 'inherit',
  }

  const primaryBtn = {
    background: T.terra,
    color: T.bg,
    border: 'none',
    borderRadius: 8,
    padding: '13px 24px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  }

  const secondaryBtn = {
    background: T.bgCard,
    color: T.tan,
    border: `1px solid rgba(196,168,130,0.15)`,
    borderRadius: 8,
    padding: '13px 24px',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: T.tan }}>

      {/* Section 1: Sticky Nav */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: T.bg,
        borderBottom: `1px solid rgba(196,168,130,0.08)`,
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 600, fontSize: 20, color: T.tan }}>Quiet</span>
        <span style={{
          background: T.bgCard,
          color: T.terra,
          fontSize: 11,
          padding: '4px 12px',
          borderRadius: 100,
          fontWeight: 500,
        }}>
          AI inbox for landlords
        </span>
        <Link
          to="/login"
          style={{ color: T.textMid, textDecoration: 'none', fontSize: 14 }}
          onMouseEnter={e => e.target.style.color = T.tan}
          onMouseLeave={e => e.target.style.color = T.textMid}
        >
          Sign in →
        </Link>
      </nav>

      {/* Section 2: Hero */}
      <section style={{ padding: '120px 24px 80px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ color: T.terra, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>
          QUIET BETA
        </div>
        <h1 style={{
          color: T.tan,
          fontSize: 'clamp(36px, 6vw, 52px)',
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: 24,
          margin: '0 0 24px',
        }}>
          Stop triaging tenant texts<br />at midnight.
        </h1>
        <p style={{
          color: T.textMid,
          fontSize: 20,
          maxWidth: 560,
          margin: '0 auto 40px',
          lineHeight: 1.6,
        }}>
          Tenant texts arrive organized, triaged, and ready for one-tap reply — so you can handle operations in one focused session, not 47 interrupted moments.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <button onClick={handlePreorder} style={primaryBtn}>
            Pre-order — $19/mo for life
          </button>
          <button
            onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            style={secondaryBtn}
          >
            See how it works
          </button>
        </div>
        <div style={{ color: T.textDim, fontSize: 13, marginBottom: 48 }}>
          ⚡ 100 spots. First 47 claimed.
        </div>
        <DailyViewMockup preview />
      </section>

      {/* Section 3: Pain Points */}
      <section style={{ padding: '80px 24px', maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: T.tan, fontSize: 32, fontWeight: 700, marginBottom: 48 }}>
          Sound familiar?
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <PainCard>
            <div style={{
              background: T.bgHover,
              borderRadius: 8,
              padding: '10px 14px',
              color: T.tan,
              fontSize: 14,
              marginBottom: 16,
              display: 'inline-block',
            }}>
              💬 "hey the ac is weird"
            </div>
            <p style={{ color: T.textMid, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              You just lost 30 minutes of your morning to back-and-forth.
            </p>
          </PainCard>
          <PainCard>
            <div style={{ fontSize: 28, marginBottom: 16 }}>☑️</div>
            <p style={{ color: T.textMid, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              You told the tenant you'd follow up. That was 4 days ago.
            </p>
          </PainCard>
          <PainCard>
            <div style={{ fontSize: 28, marginBottom: 16 }}>💬💬💬</div>
            <p style={{ color: T.textMid, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Three tenants texting at once. You have no idea which unit needs what.
            </p>
          </PainCard>
        </div>
      </section>

      {/* Section 4: How it works */}
      <section id="how-it-works" style={{ padding: '80px 24px', maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: T.tan, fontSize: 32, fontWeight: 700, marginBottom: 48 }}>
          What Quiet does
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <ValueCard
            icon="📋"
            title="Vague texts become structured tickets"
            desc="Tenant texts 'AC is weird.' Quiet auto-asks for a photo, severity, and when it started. You get a complete ticket."
          />
          <ValueCard
            icon="🔔"
            title="Nothing slips through the cracks"
            desc="Every message, every unit, on one screen. Emergencies surface instantly. Everything else queues for your review."
          />
          <ValueCard
            icon="✅"
            title="You stay in control"
            desc="Every reply needs your one-tap approval. The AI drafts; you ship. No autonomous agent messaging your tenants."
          />
        </div>
      </section>

      {/* Section 5: Product Preview */}
      <section style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: T.tan, fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          Your inbox, finally organized
        </h2>
        <p style={{ textAlign: 'center', color: T.textMid, fontSize: 16, marginBottom: 48 }}>
          This is what you see every morning.
        </p>
        <DailyViewMockup />
      </section>

      {/* Section 6: Anti-positioning */}
      <section style={{ padding: '80px 24px', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: T.tan, fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          Quiet is not another property management suite
        </h2>
        <p style={{ textAlign: 'center', color: T.textMid, fontSize: 16, marginBottom: 40 }}>
          We built one thing well. This is it.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {NOT_LIST.map(item => (
            <div key={item} style={{
              background: T.bgCard,
              borderRadius: 100,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ color: T.terra, fontWeight: 700 }}>❌</span>
              <span style={{ color: T.textMid, fontSize: 14 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Section 7: Pricing */}
      <section id="pricing" style={{ padding: '80px 24px', maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: T.tan, fontSize: 32, fontWeight: 700, marginBottom: 40 }}>
          Pre-order — $19/mo, locked for life
        </h2>
        <div style={{
          background: T.bgCard,
          borderRadius: 16,
          borderTop: `2px solid ${T.terra}`,
          padding: 32,
          marginBottom: 20,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ color: T.terra, fontSize: 56, fontWeight: 800 }}>$19</span>
            <span style={{ color: T.textMid, fontSize: 18 }}>/mo</span>
          </div>
          <p style={{ textAlign: 'center', color: T.textMid, fontSize: 14, marginBottom: 24 }}>
            Up to 25 doors. Locked forever. First 100 customers only.
          </p>
          <div style={{ marginBottom: 28 }}>
            {CHECKLIST.map(item => (
              <div key={item} style={{ color: T.textMid, fontSize: 14, padding: '6px 0', borderBottom: `1px solid rgba(196,168,130,0.06)` }}>
                {item}
              </div>
            ))}
          </div>
          <button onClick={handlePreorder} style={{ ...primaryBtn, width: '100%', textAlign: 'center', fontSize: 16 }}>
            Claim your spot →
          </button>
          <p style={{ textAlign: 'center', color: T.textDim, fontSize: 12, marginTop: 16, marginBottom: 0 }}>
            Full refund if V1 doesn't ship in 60 days. No questions asked.
          </p>
        </div>
        <p style={{ textAlign: 'center', color: T.textMid, fontSize: 14 }}>
          Standard pricing starts at $49/mo after launch. Pre-order saves you $360/year, forever.
        </p>
      </section>

      {/* Section 8: Founder */}
      <section style={{ padding: '80px 24px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ background: T.bgCard, borderRadius: 16, padding: 32 }}>
          <h2 style={{ color: T.tan, fontSize: 28, fontWeight: 700, marginBottom: 24, marginTop: 0 }}>
            Built by a landlord who codes.
          </h2>
          <p style={{ color: T.textMid, fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            I'm Dre. I own a duplex in Derby, KS and I got tired of answering maintenance texts at 11pm. I'm also a software developer and veteran. So I built the tool I needed.
          </p>
          <p style={{ color: T.textMid, fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            I'm building Quiet in public. Every week I'll share what's working, what's not, and how many customers we have. No hype.
          </p>
          <p style={{ color: T.textMid, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            Pre-order gets you into a private group with me — direct access, honest updates, and first say on what gets built next.
          </p>
        </div>
      </section>

      {/* Section 9: FAQ */}
      <section style={{ padding: '80px 24px', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ color: T.tan, fontSize: 32, fontWeight: 700, marginBottom: 32 }}>
          Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQS.map(faq => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* Section 10: Email Capture / Waitlist */}
      <section id="waitlist" style={{ padding: '80px 24px', maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: T.textMid, fontSize: 26, fontWeight: 600, marginBottom: 12 }}>
          Not ready to pre-order?
        </h2>
        <p style={{ textAlign: 'center', color: T.textMid, fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          Join the waitlist. I'll email you when we launch — and share what we're building along the way.
        </p>
        {waitlistStatus === 'success' ? (
          <p style={{ textAlign: 'center', color: T.olive, fontSize: 16, fontWeight: 500 }}>
            You're on the list. Talk soon.
          </p>
        ) : waitlistStatus === 'duplicate' ? (
          <p style={{ textAlign: 'center', color: T.textMid, fontSize: 16 }}>
            Already on the list!
          </p>
        ) : waitlistStatus === 'error' ? (
          <p style={{ textAlign: 'center', color: T.terra, fontSize: 15 }}>
            Something went wrong. Try again.
          </p>
        ) : (
          <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = T.terra}
              onBlur={e => e.target.style.borderColor = 'rgba(196,168,130,0.2)'}
            />
            <button type="submit" disabled={submitting} style={{ ...primaryBtn, opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Joining…' : 'Join waitlist'}
            </button>
          </form>
        )}
      </section>

      {/* Section 11: Footer */}
      <footer style={{
        borderTop: `1px solid rgba(196,168,130,0.08)`,
        padding: '32px 24px',
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <span style={{ color: T.textDim, fontSize: 13 }}>© 2026 IN TIME REALTY LLC</span>
        <Link to="/privacy" style={{ color: T.textDim, fontSize: 13, textDecoration: 'none' }}>Privacy</Link>
        <Link to="/terms" style={{ color: T.textDim, fontSize: 13, textDecoration: 'none' }}>Terms</Link>
      </footer>

    </div>
  )
}
