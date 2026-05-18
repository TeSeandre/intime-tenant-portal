import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { THEMES } from '../lib/theme'
import { supabase } from '../lib/supabase'
import DailyViewMockup from './quiet/DailyViewMockup'

const T = THEMES.warmEarth

const STRIPE_PREORDER_URL = import.meta.env.VITE_STRIPE_PREORDER_URL

function handlePreorder() {
  if (STRIPE_PREORDER_URL) {
    window.open(STRIPE_PREORDER_URL, '_blank', 'noopener,noreferrer')
  } else {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
  }
}

function useScrolled(threshold = 600) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function revealStyle(visible) {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(18px)',
    transition: 'opacity 0.55s ease, transform 0.55s ease',
  }
}

function PageStyles() {
  return (
    <style>{`
      .q-btn-primary {
        background: ${T.terra};
        color: #FFF8F0;
        border: none;
        cursor: pointer;
        transition: background 0.15s;
      }
      .q-btn-primary:hover { background: ${T.terraHover}; }
      .q-btn-secondary {
        background: ${T.bgCard};
        color: ${T.tan};
        border: 1px solid rgba(196,168,130,0.2);
        cursor: pointer;
        transition: background 0.15s;
      }
      .q-btn-secondary:hover { background: ${T.bgHover}; }
      .q-faq-trigger { background: ${T.bgCard}; transition: background 0.15s; }
      .q-faq-trigger:hover { background: ${T.bgHover}; }
      .q-input { transition: border-color 0.15s; }
      .q-input:focus { border-color: rgba(196,168,130,0.45) !important; outline: none; }
      .q-nav-link { color: ${T.textMid}; transition: color 0.15s; }
      .q-nav-link:hover { color: ${T.tan}; }
    `}</style>
  )
}

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
  return (
    <button
      className="q-btn-primary"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 28px',
        borderRadius: 8,
        fontSize: 15,
        fontWeight: 700,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function SecondaryBtn({ children, onClick, style }) {
  return (
    <button
      className="q-btn-secondary"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 28px',
        borderRadius: 8,
        fontSize: 15,
        fontWeight: 600,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function StickyCTA({ visible }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: `${T.bgCard}f5`,
        backdropFilter: 'blur(12px)',
        borderTop: `1px solid rgba(194,112,62,0.25)`,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
      }}
    >
      <div>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.tan }}>Quiet — $19/mo locked for life</span>
        <span style={{ fontSize: 12, color: T.textDim, marginLeft: 10 }}>First 100 customers · 47 claimed</span>
      </div>
      <PrimaryBtn onClick={handlePreorder} style={{ padding: '10px 20px', fontSize: 14 }}>
        Claim your spot →
      </PrimaryBtn>
    </div>
  )
}

const FAQS = [
  {
    q: 'When does V1 launch?',
    a: "60 days from hitting 5 pre-orders. I'll email you the day it goes live — targeting late summer 2026.",
  },
  {
    q: "What if it doesn't ship?",
    a: 'Full refund, no questions. Your card is charged immediately to make the commitment real — but if V1 does not launch within 60 days of your pre-order, you get every dollar back automatically.',
  },
  {
    q: 'Does my tenant ever see any AI?',
    a: "No. In V1, Quiet only assists you. Every outbound message needs your one-tap approval before it sends. Tenants interact with you — the AI just helps you respond faster and never misses anything.",
  },
  {
    q: 'Do I need to change my tenant contact info?',
    a: 'You get a dedicated US phone number through Quiet. You can give tenants the new number or forward from your existing number. Either works — your choice. Tenants never know anything changed.',
  },
  {
    q: 'I have 8 doors. Can I still use Quiet?',
    a: 'Yes — free tier covers 1–3 units, and the pre-order ($19/mo locked) covers up to 25. If you have 8 doors now, you pay pre-order pricing as you scale to 10, 15, 20+ doors. No price increase, ever.',
  },
  {
    q: 'How many doors does $19/mo cover?',
    a: 'Up to 25 doors at the pre-order price — permanently. Standard pricing starts at $49/mo (up to 10 doors) or $125/mo (up to 25 doors) after launch. Pre-ordering saves you $360–$1,272/year.',
  },
  {
    q: 'Is my tenant data secure?',
    a: "Yes. All data encrypted at rest and in transit. Row-level security means your data is yours alone — we cannot read it, and we don't sell or share it.",
  },
  {
    q: "What's the refund policy after launch?",
    a: '30-day satisfaction guarantee after V1 launches. If it does not work for your operation in the first 30 days, full refund, no questions.',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
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
        className="q-faq-trigger"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 16px',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: T.tan, lineHeight: 1.4 }}>{q}</span>
        <span style={{
          fontSize: 16,
          color: T.textMid,
          flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>
          ▾
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px', background: T.bgCard, fontSize: 14, color: T.textMid, lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  )
}

function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [doors, setDoors] = useState('')
  const [status, setStatus] = useState('idle')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    const name = doors ? `${doors} doors` : ''
    const { error } = await supabase.from('contact_inquiries').insert({ email: email.trim(), name })
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
        <div style={{ fontSize: 14, color: T.textMid }}>
          I'll email you with updates, behind-the-scenes progress, and your early access invite.
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <input
          type="email"
          className="q-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            flex: 1,
            minWidth: 200,
            padding: '12px 16px',
            borderRadius: 8,
            border: `1px solid rgba(196,168,130,0.15)`,
            background: T.bgCard,
            color: T.tan,
            fontSize: 14,
          }}
        />
        <select
          value={doors}
          onChange={e => setDoors(e.target.value)}
          style={{
            padding: '12px 14px',
            borderRadius: 8,
            border: `1px solid rgba(196,168,130,0.15)`,
            background: T.bgCard,
            color: doors ? T.tan : T.textDim,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <option value="">How many doors?</option>
          <option value="1-9">1–9 doors</option>
          <option value="10-24">10–24 doors</option>
          <option value="25-49">25–49 doors</option>
          <option value="50+">50+ doors</option>
        </select>
      </div>
      <PrimaryBtn style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
        {status === 'loading' ? 'Joining...' : 'Join the waitlist →'}
      </PrimaryBtn>
      {status === 'duplicate' && (
        <p style={{ fontSize: 13, color: T.olive, marginTop: 8 }}>Already on the list — I'll be in touch.</p>
      )}
      {status === 'error' && (
        <p style={{ fontSize: 13, color: T.terra, marginTop: 8 }}>Something went wrong. Try again.</p>
      )}
    </form>
  )
}

const FOR_WHO = [
  'You own 10–50 units, self-managed',
  'You manage them yourself or with one helper',
  'Real estate is serious income — not your only income',
  'Your tenants have your personal cell number',
  'You spend 5–15 hours/week on tenant communication',
  'You currently use Stessa, Baselane, or a spreadsheet',
]

const NOT_FOR_WHO = [
  'Property management companies (wrong tool)',
  'Single-unit landlords forever (free tier only)',
  'Institutional landlords or REITs',
]

const PAIN_POINTS = [
  {
    from: 'Marcus T. — Unit 2B — 6:43 AM',
    bubble: '"the ac is making a weird noise and it kind of smells"',
    caption: 'What noise? How weird? How long? You just spent 35 minutes back-and-forth to get the info you needed before you could even call an HVAC tech.',
  },
  {
    from: 'Keisha M. — Unit 1A — 4 days ago',
    bubble: '"hey you said you\'d get back to me about the bathroom faucet"',
    caption: "You forgot. Not because you're irresponsible — because you have 14 other tenants and that text got buried. Now she's frustrated.",
  },
  {
    from: 'Your phone — Tuesday morning',
    bubble: '3 new texts. 2 missed calls. 1 voicemail.',
    caption: "Three different tenants, three different issues, all before 8am. You have a 9am meeting. You have no system. You're triaging everything in your head.",
  },
]

const VALUE_PROPS = [
  {
    icon: '📋',
    title: 'Vague texts become structured tickets',
    desc: 'Tenant texts "AC is making a weird noise." Quiet automatically asks for a photo, how long it\'s been happening, and a severity rating. You get a complete ticket — not a 30-minute interrogation.',
  },
  {
    icon: '🔔',
    title: 'Nothing slips through the cracks',
    desc: 'Every message, every unit, one screen. Actual emergencies (water, gas, fire, smoke) hit your phone instantly — no AI in the path. Everything else queues for your morning review.',
  },
  {
    icon: '✅',
    title: 'You stay in control — always',
    desc: "Every reply needs your one-tap approval before it sends. The AI drafts; you ship. No bot texts your tenants autonomously. In V1, this is a hard rule, not a setting.",
  },
]

const HOW_IT_WORKS = [
  {
    n: '1',
    title: 'Tenant texts your Quiet number',
    desc: 'You get a dedicated US phone number. Forward your existing number or give tenants the new one. They text the same way they always have.',
  },
  {
    n: '2',
    title: 'AI triages and structures the request',
    desc: 'Emergency keywords (fire, flood, gas, water) trigger an instant push to you — no AI in that path. For maintenance, AI asks up to 3 follow-up questions and builds a structured ticket.',
  },
  {
    n: '3',
    title: 'You approve, one tap',
    desc: 'You see the complete ticket plus an AI-drafted reply in your voice. Edit or approve. Nothing sends without you. Your tenant gets a professional, timely response.',
  },
]

const NOT_LIST = [
  'Property management software',
  'A tenant portal or app',
  'Accounting or bookkeeping',
  'A listing or screening tool',
  'A payment processor',
  'An autonomous AI agent',
  'Built for property managers',
  'Another dashboard full of charts',
]

export default function QuietLandingPage() {
  const showStickyCTA = useScrolled(700)
  const [heroRef, heroVisible] = useReveal()
  const [painRef, painVisible] = useReveal()
  const [howRef, howVisible] = useReveal()
  const [valueRef, valueVisible] = useReveal()
  const [mockupRef, mockupVisible] = useReveal()
  const [pricingRef, pricingVisible] = useReveal()
  const [founderRef, founderVisible] = useReveal()

  return (
    <div
      style={{
        background: T.bg,
        minHeight: '100vh',
        color: T.tan,
        fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
      }}
    >
      <PageStyles />
      <StickyCTA visible={showStickyCTA} />

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
        <Link to="/login" className="q-nav-link" style={{ fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
          Sign in →
        </Link>
      </nav>

      <section
        ref={heroRef}
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '96px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          ...revealStyle(heroVisible),
        }}
      >
        <Chip style={{ marginBottom: 20 }}>QUIET BETA — $19/mo locked for life</Chip>

        <div style={{ fontSize: 13, color: T.textDim, marginBottom: 16, letterSpacing: '0.3px' }}>
          Built for landlords who own 10–50 units and manage them themselves.
        </div>

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
            lineHeight: 1.65,
            maxWidth: 560,
            marginBottom: 32,
          }}
        >
          Tenant texts land organized, AI-triaged, and ready for one-tap reply.
          Handle all operations in one focused morning session — not 40 interruptions throughout your day.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }}>
          <PrimaryBtn onClick={handlePreorder}>Claim your spot →</PrimaryBtn>
          <SecondaryBtn onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
            See how it works
          </SecondaryBtn>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ width: 200, height: 3, background: T.bgHover, borderRadius: 2, margin: '0 auto 6px' }}>
            <div style={{ width: '47%', height: '100%', background: T.terra, borderRadius: 2 }} />
          </div>
          <p style={{ fontSize: 12, color: T.textDim }}>47 of 100 pre-order spots claimed</p>
        </div>

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
          <div style={{ background: T.bgCard, borderRadius: 20, overflow: 'hidden' }}>
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

      <section
        ref={painRef}
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '80px 24px',
          ...revealStyle(painVisible),
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
          These three moments eat 6–10 hours a week for the average 15-unit operator.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
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
              <div style={{ fontSize: 11, color: T.textDim, marginBottom: 8, fontFamily: 'monospace' }}>{p.from}</div>
              <div
                style={{
                  background: T.bgHover,
                  border: `1px solid rgba(196,168,130,0.1)`,
                  borderRadius: 10,
                  borderBottomLeftRadius: 2,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: T.tan,
                  marginBottom: 16,
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}
              >
                {p.bubble}
              </div>
              <p style={{ fontSize: 13, color: T.textMid, lineHeight: 1.65 }}>{p.caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          background: T.bgAlt,
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(22px, 3.5vw, 30px)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 8,
              color: T.tan,
            }}
          >
            This is built for one person.
          </h2>
          <p style={{ textAlign: 'center', color: T.textMid, marginBottom: 40, fontSize: 15 }}>
            Not everyone. One specific person. Check the list.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            <div
              style={{
                background: T.bgCard,
                border: `1px solid rgba(107,132,85,0.2)`,
                borderTop: `3px solid ${T.olive}`,
                borderRadius: 12,
                padding: '24px 20px',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: T.olive, marginBottom: 14, letterSpacing: '0.5px' }}>
                ✓ THIS IS FOR YOU IF
              </div>
              {FOR_WHO.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '7px 0',
                    borderBottom: i < FOR_WHO.length - 1 ? `1px solid rgba(196,168,130,0.06)` : 'none',
                    fontSize: 14,
                    color: T.textMid,
                  }}
                >
                  <span style={{ color: T.olive, flexShrink: 0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
            <div
              style={{
                background: T.bgCard,
                border: `1px solid rgba(194,112,62,0.15)`,
                borderTop: `3px solid rgba(194,112,62,0.35)`,
                borderRadius: 12,
                padding: '24px 20px',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textDim, marginBottom: 14, letterSpacing: '0.5px' }}>
                ✕ THIS IS NOT FOR YOU IF
              </div>
              {NOT_FOR_WHO.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '7px 0',
                    borderBottom: i < NOT_FOR_WHO.length - 1 ? `1px solid rgba(196,168,130,0.06)` : 'none',
                    fontSize: 14,
                    color: T.textDim,
                  }}
                >
                  <span style={{ color: T.terra, flexShrink: 0, opacity: 0.6 }}>✕</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        ref={howRef}
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '80px 24px',
          ...revealStyle(howVisible),
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
          How it works in 60 seconds
        </h2>
        <p style={{ textAlign: 'center', color: T.textMid, marginBottom: 48, fontSize: 15 }}>
          Tenant texts → AI structures → you approve. That's the whole loop.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: T.terra,
                  color: '#FFF8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 800,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {step.n}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.tan, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={valueRef}
        style={{
          background: T.bgAlt,
          padding: '80px 24px',
          ...revealStyle(valueVisible),
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
                <div style={{ width: 32, height: 2, background: T.terra, borderRadius: 1, marginBottom: 14 }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: T.tan, marginBottom: 10 }}>{vp.title}</h3>
                <p style={{ fontSize: 14, color: T.textMid, lineHeight: 1.7 }}>{vp.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <PrimaryBtn onClick={handlePreorder}>Claim your spot — $19/mo →</PrimaryBtn>
            <p style={{ fontSize: 12, color: T.textDim, marginTop: 10 }}>First 100 customers only · locked for life</p>
          </div>
        </div>
      </section>

      <section
        ref={mockupRef}
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '80px 24px',
          ...revealStyle(mockupVisible),
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
          Your inbox, finally organized
        </h2>
        <p style={{ textAlign: 'center', color: T.textMid, marginBottom: 16, fontSize: 15 }}>
          This is what you see every morning. The AI Draft on the first message shows the one-tap reply.
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderBottom: `1px solid rgba(196,168,130,0.08)` }}>
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
                <span style={{ color: T.terra, fontWeight: 700, flexShrink: 0, opacity: 0.7 }}>✕</span>
                <span style={{ fontSize: 13, color: T.textMid }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        ref={pricingRef}
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '80px 24px',
          ...revealStyle(pricingVisible),
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
          Pre-order — $19/mo, locked for life.
        </h2>
        <p style={{ textAlign: 'center', color: T.textMid, marginBottom: 8, fontSize: 15 }}>
          Standard pricing starts at $49/mo at launch. Pre-order saves you $360/year, every year.
        </p>
        <p style={{ textAlign: 'center', color: T.textDim, marginBottom: 40, fontSize: 13 }}>
          At 15 doors, that's $1.27 per door per month — less than one text message to your plumber.
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
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
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

          <div style={{ marginBottom: 24 }}>
            <div style={{ height: 4, background: T.bgHover, borderRadius: 2, marginBottom: 6 }}>
              <div style={{ width: '47%', height: '100%', background: T.terra, borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: 12, color: T.textDim, textAlign: 'center' }}>47 of 100 pre-order spots claimed</p>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28 }}>
            {[
              'SMS inbound triage — all your units, one number',
              'AI-structured maintenance tickets with photos',
              'One-tap reply with AI draft in your voice',
              'Emergency escalation — instant push, no AI in the path',
              'Full thread history per unit (audit-ready)',
              'Direct line to the founder (private group)',
              'Your feature requests shape V2 roadmap',
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

          <p style={{ textAlign: 'center', fontSize: 12, color: T.textDim, marginTop: 14, lineHeight: 1.6 }}>
            Full refund if V1 doesn't ship in 60 days. No questions asked.
          </p>
        </div>
      </section>

      <section style={{ background: T.bgAlt, padding: '80px 24px' }}>
        <div
          ref={founderRef}
          style={{
            maxWidth: 640,
            margin: '0 auto',
            background: T.bgCard,
            borderRadius: 12,
            padding: '36px 32px',
            border: `1px solid rgba(196,168,130,0.1)`,
            ...revealStyle(founderVisible),
          }}
        >
          <div style={{ fontSize: 11, color: T.terra, fontWeight: 700, letterSpacing: '1.5px', marginBottom: 16 }}>
            FROM THE FOUNDER
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.tan, marginBottom: 20 }}>
            Built by a landlord who codes.
          </h2>
          <p style={{ fontSize: 15, color: T.textMid, lineHeight: 1.8, marginBottom: 14 }}>
            I'm Dre. I own a duplex in Derby, KS and I got tired of answering maintenance texts at 11pm on a Tuesday when I had to be at Textron at 6am. I'm also a software developer, a veteran, and a full-time dad. So I built the tool I needed.
          </p>
          <p style={{ fontSize: 15, color: T.textMid, lineHeight: 1.8, marginBottom: 14 }}>
            I'm building Quiet in public. Every week in{' '}
            <span style={{ color: T.tan, fontWeight: 600 }}>The Quiet Operator</span>
            {' '}newsletter, I share what's working, what's not, and the exact MRR. No hype. No "coming soon" theater.
          </p>
          <p style={{ fontSize: 15, color: T.textMid, lineHeight: 1.8 }}>
            Pre-ordering gets you into a private group with me — direct access, honest updates, and your feature requests go to the top of the V2 list.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: T.tan, marginBottom: 28 }}>Questions</h2>
        {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
      </section>

      <section
        id="waitlist"
        style={{ background: T.bgAlt, padding: '80px 24px' }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.tan, marginBottom: 8 }}>
            Not ready to pre-order?
          </h2>
          <p style={{ fontSize: 15, color: T.textMid, marginBottom: 8, lineHeight: 1.6 }}>
            Join The Quiet Operator waitlist. I'll email you launch updates, behind-the-scenes build progress, and operational tactics for self-managing landlords.
          </p>
          <p style={{ fontSize: 13, color: T.textDim, marginBottom: 28 }}>
            No spam. Unsubscribe any time. I write this myself, every week.
          </p>
          <WaitlistForm />
        </div>
      </section>

      <footer
        style={{
          borderTop: `1px solid rgba(196,168,130,0.08)`,
          padding: '28px 24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 13, color: T.textDim }}>© 2026 IN TIME REALTY LLC</span>
        <span style={{ color: T.textDim, fontSize: 10 }}>·</span>
        <Link to="/privacy" style={{ fontSize: 13, color: T.textDim, textDecoration: 'none' }}>Privacy</Link>
        <Link to="/terms" style={{ fontSize: 13, color: T.textDim, textDecoration: 'none' }}>Terms</Link>
        <span style={{ color: T.textDim, fontSize: 10 }}>·</span>
        <span style={{ fontSize: 13, color: T.textDim }}>
          Written by a landlord. <span style={{ color: T.tan }}>Quiet by IN TIME REALTY.</span>
        </span>
      </footer>
    </div>
  )
}
