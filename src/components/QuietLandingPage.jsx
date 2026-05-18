import { useState } from 'react'
import { Link } from 'react-router-dom'
import { THEMES } from '../lib/theme'
import { supabase } from '../lib/supabase'
import DailyViewMockup from './quiet/DailyViewMockup'

const T = THEMES.warmEarth

// ─── Reusable primitives ────────────────────────────────────────────────────

function Chip({ children, style }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.5px',
        padding: '4px 10px',
        borderRadius: 20,
        background: T.bgCard,
        color: T.terra,
        border: `1px solid rgba(194,112,62,0.25)`,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

function PrimaryBtn({ children, onClick, style }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 28px',
        borderRadius: 8,
        border: 'none',
        background: hovered ? '#D4813A' : T.terra,
        color: '#FFF8F0',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'background 0.15s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function SecondaryBtn({ children, onClick, style }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 28px',
        borderRadius: 8,
        border: `1px solid rgba(196,168,130,0.2)`,
        background: hovered ? T.bgHover : T.bgCard,
        color: T.tan,
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.15s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ─── Stripe CTA ─────────────────────────────────────────────────────────────

function handlePreorder() {
  const url = import.meta.env.VITE_STRIPE_PREORDER_URL
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' })
  }
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'When does V1 launch?',
    a: "60 days from hitting 5 pre-orders. I'll email you when we go live — currently targeting late summer 2026.",
  },
  {
    q: "What if it doesn't ship?",
    a: 'Full refund, no questions. Your card is charged immediately to make the commitment real — but if V1 does not launch within 60 days of your pre-order, you get every dollar back automatically.',
  },
  {
    q: 'Does my tenant ever see any AI?',
    a: "No. In V1, Quiet only assists you. Every outbound message requires your one-tap approval before it sends. Tenants interact with you — the AI just helps you respond faster.",
  },
  {
    q: 'Do I need to change my tenant contact info?',
    a: 'You get a dedicated US phone number through Quiet. You can either give tenants the new number directly or set up a forward from your existing number. Either works — your choice.',
  },
  {
    q: 'What carriers and phones work?',
    a: 'Any SMS-capable phone number in the US. Your tenants do not need to install anything or change how they text you.',
  },
  {
    q: 'How many doors does $19/mo cover?',
    a: 'Pre-order locks you in at $19/mo for up to 25 doors — permanently, even after standard pricing starts at $49/mo at launch. That saves you $360/year, every year.',
  },
  {
    q: 'Is my tenant data secure?',
    a: "Yes. All data is encrypted at rest and in transit. Row-level security means your data is yours and only yours — we cannot read it, and we don't sell or share it.",
  },
  {
    q: "What's the refund policy after launch?",
    a: '30-day satisfaction guarantee after V1 launches. If it does not work for your operation in the first 30 days, full refund, no questions.',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid rgba(196,168,130,${open ? '0.18' : '0.1'})`,
        marginBottom: 8,
        borderLeft: open ? `3px solid ${T.terra}` : `3px solid transparent`,
        transition: 'border-color 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 16px',
          background: hovered || open ? T.bgHover : T.bgCard,
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.15s',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: T.tan, lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 16, color: T.textMid, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▾
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: '0 16px 14px',
            background: T.bgCard,
            fontSize: 14,
            color: T.textMid,
            lineHeight: 1.7,
          }}
        >
          {a}
        </div>
      )}
    </div>
  )
}

// ─── Email capture ───────────────────────────────────────────────────────────

function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | duplicate | error
  const [inputFocused, setInputFocused] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    const { error } = await supabase.from('contact_inquiries').insert({ email: email.trim(), name: '' })
    if (!error) {
      setStatus('success')
    } else if (error.code === '23505') {
      setStatus('duplicate')
    } else {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.tan, marginBottom: 4 }}>You're on the list.</div>
        <div style={{ fontSize: 14, color: T.textMid }}>I'll email you with updates and an early access invite.</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="your@email.com"
          required
          style={{
            flex: 1,
            minWidth: 200,
            padding: '12px 16px',
            borderRadius: 8,
            border: `1px solid rgba(196,168,130,${inputFocused ? '0.4' : '0.15'})`,
            background: T.bgCard,
            color: T.tan,
            fontSize: 14,
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
        />
        <PrimaryBtn style={{ padding: '12px 24px', fontSize: 14 }}>
          {status === 'loading' ? 'Joining...' : 'Join waitlist'}
        </PrimaryBtn>
      </div>
      {status === 'duplicate' && (
        <p style={{ fontSize: 13, color: T.olive, marginTop: 8 }}>Already on the list! I'll be in touch.</p>
      )}
      {status === 'error' && (
        <p style={{ fontSize: 13, color: T.terra, marginTop: 8 }}>Something went wrong. Try again.</p>
      )}
    </form>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

const NOT_LIST = [
  'Property management software',
  'A tenant portal or app',
  'Accounting or bookkeeping',
  'A listing or screening tool',
  'A payment processor',
  'An autonomous AI agent',
  'Built for property managers',
  'Another dashboard of charts',
]

const PAIN_POINTS = [
  {
    bubble: '"hey the ac is weird"',
    caption: 'You just lost 30 minutes to back-and-forth trying to understand what "weird" actually means.',
  },
  {
    icon: '📌',
    caption: 'You told the tenant you\'d follow up on the dripping faucet. That was four days ago.',
  },
  {
    icon: '📱',
    caption: 'Three tenants texting simultaneously. No idea which unit needs what or what you already handled.',
  },
]

const VALUE_PROPS = [
  {
    icon: '📋',
    title: 'Vague texts become structured tickets',
    desc: 'Tenant texts "AC is weird." Quiet auto-asks for a photo, severity, and when it started. You get a complete ticket — not a guessing game.',
  },
  {
    icon: '🔔',
    title: 'Nothing slips through the cracks',
    desc: 'Every message, every unit, on one screen. Emergencies surface instantly. Everything else queues for your review session.',
  },
  {
    icon: '✅',
    title: 'You stay in control',
    desc: 'Every reply needs your one-tap approval before it sends. The AI drafts — you ship. No bot messaging your tenants.',
  },
]

export default function QuietLandingPage() {
  return (
    <div
      style={{
        background: T.bg,
        minHeight: '100vh',
        color: T.tan,
        fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
      }}
    >
      {/* ── Nav ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 56,
          background: `${T.bg}f0`,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid rgba(196,168,130,0.08)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.tan, letterSpacing: '-0.5px' }}>Quiet</span>
          <Chip style={{ fontSize: 10, padding: '2px 8px' }}>AI inbox for landlords</Chip>
        </div>
        <Link
          to="/login"
          style={{ fontSize: 13, color: T.textMid, textDecoration: 'none', fontWeight: 500 }}
          onMouseEnter={e => (e.target.style.color = T.tan)}
          onMouseLeave={e => (e.target.style.color = T.textMid)}
        >
          Sign in →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '96px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Chip style={{ marginBottom: 24 }}>QUIET BETA — $19/mo locked for life</Chip>

        <h1
          style={{
            fontSize: 'clamp(32px, 6vw, 58px)',
            fontWeight: 800,
            color: T.tan,
            lineHeight: 1.08,
            letterSpacing: '-1.5px',
            marginBottom: 20,
            maxWidth: 700,
          }}
        >
          Stop triaging tenant texts at midnight.
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: T.textMid,
            lineHeight: 1.6,
            maxWidth: 560,
            marginBottom: 32,
          }}
        >
          Tenant texts arrive organized, triaged, and ready for one-tap reply — so you handle operations in one focused session, not 47 interrupted moments.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
          <PrimaryBtn onClick={handlePreorder}>Claim your spot →</PrimaryBtn>
          <SecondaryBtn onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
            See how it works
          </SecondaryBtn>
        </div>

        <p style={{ fontSize: 12, color: T.textDim, marginBottom: 56 }}>
          ⚡ 100 spots. First 47 claimed.
        </p>

        {/* Phone frame mockup */}
        <div
          style={{
            width: '100%',
            maxWidth: 360,
            background: T.bgAlt,
            borderRadius: 28,
            padding: '12px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)',
            border: `1px solid rgba(196,168,130,0.1)`,
          }}
        >
          <div
            style={{
              background: T.bgCard,
              borderRadius: 20,
              overflow: 'hidden',
              padding: '0',
            }}
          >
            {/* Status bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 16px 4px',
                fontSize: 10,
                color: T.textDim,
              }}
            >
              <span>9:41</span>
              <span>●●●</span>
            </div>
            <div style={{ padding: '0 8px 8px' }}>
              <DailyViewMockup preview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain points ── */}
      <section
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '80px 24px',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 8,
            color: T.tan,
          }}
        >
          Sound familiar?
        </h2>
        <p style={{ textAlign: 'center', color: T.textMid, marginBottom: 40, fontSize: 15 }}>
          These are the three moments that eat your week.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {PAIN_POINTS.map((p, i) => (
            <div
              key={i}
              style={{
                background: T.bgCard,
                border: `1px solid rgba(196,168,130,0.1)`,
                borderRadius: 12,
                padding: '24px 20px',
              }}
            >
              {p.bubble ? (
                <div
                  style={{
                    background: T.bgHover,
                    border: `1px solid rgba(196,168,130,0.12)`,
                    borderRadius: 12,
                    borderBottomLeftRadius: 2,
                    padding: '10px 14px',
                    fontSize: 14,
                    color: T.tan,
                    marginBottom: 16,
                    fontStyle: 'italic',
                  }}
                >
                  {p.bubble}
                </div>
              ) : (
                <div style={{ fontSize: 28, marginBottom: 16 }}>{p.icon}</div>
              )}
              <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.6 }}>{p.caption}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        style={{
          background: T.bgAlt,
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 8,
              color: T.tan,
            }}
          >
            What Quiet does
          </h2>
          <p style={{ textAlign: 'center', color: T.textMid, marginBottom: 48, fontSize: 15 }}>
            One job, done well.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {VALUE_PROPS.map((vp, i) => (
              <div
                key={i}
                style={{
                  background: T.bgCard,
                  borderRadius: 12,
                  padding: '28px 24px',
                  border: `1px solid rgba(196,168,130,0.1)`,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{vp.icon}</div>
                <div
                  style={{
                    width: 32,
                    height: 2,
                    background: T.terra,
                    borderRadius: 1,
                    marginBottom: 14,
                  }}
                />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.tan, marginBottom: 10 }}>{vp.title}</h3>
                <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.7 }}>{vp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product preview ── */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '80px 24px' }}>
        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 8,
            color: T.tan,
          }}
        >
          Your inbox, finally organized
        </h2>
        <p style={{ textAlign: 'center', color: T.textMid, marginBottom: 48, fontSize: 15 }}>
          This is what you see every morning.
        </p>
        <div
          style={{
            maxWidth: 640,
            margin: '0 auto',
            background: T.bgCard,
            borderRadius: 12,
            padding: '8px',
            border: `1px solid rgba(196,168,130,0.12)`,
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderBottom: `1px solid rgba(196,168,130,0.08)`,
            }}
          >
            {['#FF5F57', '#FFBD2E', '#28C840'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
            ))}
            <div
              style={{
                flex: 1,
                marginLeft: 8,
                height: 22,
                background: T.bgHover,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 10,
              }}
            >
              <span style={{ fontSize: 11, color: T.textDim }}>app.quiet.so/inbox</span>
            </div>
          </div>
          <div style={{ padding: '8px' }}>
            <DailyViewMockup />
          </div>
        </div>
      </section>

      {/* ── Anti-positioning ── */}
      <section style={{ background: T.bgAlt, padding: '80px 24px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 8,
              color: T.tan,
            }}
          >
            Quiet is not another property management suite.
          </h2>
          <p style={{ textAlign: 'center', color: T.textMid, marginBottom: 40, fontSize: 15 }}>
            We built one thing well. This is it.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {NOT_LIST.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: T.bgCard,
                  border: `1px solid rgba(196,168,130,0.08)`,
                  borderRadius: 8,
                  padding: '10px 14px',
                }}
              >
                <span style={{ color: T.terra, fontWeight: 700, flexShrink: 0 }}>✕</span>
                <span style={{ fontSize: 13, color: T.textMid }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px' }}>
        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 8,
            color: T.tan,
          }}
        >
          Pre-order — $19/mo, locked for life.
        </h2>
        <p style={{ textAlign: 'center', color: T.textMid, marginBottom: 40, fontSize: 15 }}>
          Standard pricing starts at $49/mo after launch. Pre-order saves you $360/year, every year.
        </p>

        <div
          style={{
            background: T.bgCard,
            borderRadius: 16,
            borderTop: `3px solid ${T.terra}`,
            padding: '36px 32px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: T.terra, letterSpacing: '-2px', lineHeight: 1 }}>
              $19
            </div>
            <div style={{ fontSize: 15, color: T.textMid, marginTop: 4 }}>per month · up to 25 doors</div>
            <div
              style={{
                display: 'inline-block',
                marginTop: 10,
                fontSize: 12,
                fontWeight: 600,
                color: T.olive,
                background: `${T.olive}18`,
                padding: '4px 12px',
                borderRadius: 20,
              }}
            >
              Locked for life · First 100 customers only
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28 }}>
            {[
              'SMS inbound triage (all your units)',
              'AI-structured maintenance tickets',
              'One-tap reply with AI draft',
              'Emergency escalation — instant push notification',
              'Full thread history per unit',
              'Direct line to the founder (private group)',
              'Your feature requests shape V2',
            ].map((item, i) => (
              <li
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: i < 6 ? `1px solid rgba(196,168,130,0.06)` : 'none',
                  fontSize: 14,
                  color: T.textMid,
                }}
              >
                <span style={{ color: T.olive, fontWeight: 700, flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>

          <PrimaryBtn onClick={handlePreorder} style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
            Claim your spot →
          </PrimaryBtn>

          <p
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: T.textDim,
              marginTop: 14,
              lineHeight: 1.6,
            }}
          >
            Full refund if V1 doesn't ship in 60 days. No questions asked.
          </p>
        </div>
      </section>

      {/* ── Founder ── */}
      <section style={{ background: T.bgAlt, padding: '80px 24px' }}>
        <div
          style={{
            maxWidth: 640,
            margin: '0 auto',
            background: T.bgCard,
            borderRadius: 12,
            padding: '36px 32px',
            border: `1px solid rgba(196,168,130,0.1)`,
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.tan, marginBottom: 20 }}>
            Built by a landlord who codes.
          </h2>
          <p style={{ fontSize: 15, color: T.textMid, lineHeight: 1.8, marginBottom: 14 }}>
            I'm Dre. I own a duplex in Derby, KS and I got tired of answering maintenance texts at 11pm. I'm also a software developer, a veteran, and a full-time dad. So I built the tool I needed.
          </p>
          <p style={{ fontSize: 15, color: T.textMid, lineHeight: 1.8, marginBottom: 14 }}>
            I'm building Quiet in public. Every week I share what's working, what's not, and how many customers we have. No hype. No "coming soon" theater.
          </p>
          <p style={{ fontSize: 15, color: T.textMid, lineHeight: 1.8 }}>
            Pre-ordering gets you into a private group with me — direct access, honest updates, and first say on what gets built next.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: T.tan, marginBottom: 28 }}>Questions</h2>
        {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
      </section>

      {/* ── Waitlist ── */}
      <section
        id="waitlist"
        style={{
          background: T.bgAlt,
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.tan, marginBottom: 8 }}>
            Not ready to pre-order?
          </h2>
          <p style={{ fontSize: 15, color: T.textMid, marginBottom: 28, lineHeight: 1.6 }}>
            Join the waitlist. I'll email you when we launch — and share what we're building along the way.
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: `1px solid rgba(196,168,130,0.08)`,
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 13, color: T.textDim }}>© 2026 IN TIME REALTY LLC</span>
        <Link to="/privacy" style={{ fontSize: 13, color: T.textDim, textDecoration: 'none' }}>Privacy</Link>
        <Link to="/terms" style={{ fontSize: 13, color: T.textDim, textDecoration: 'none' }}>Terms</Link>
      </footer>
    </div>
  )
}
