import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import T from "../lib/theme";
import { supabase } from "../lib/supabase";
const font = "'DM Sans', 'Avenir Next', sans-serif";
const serif = "'Playfair Display', 'Georgia', serif";

/* ─── SCROLL REVEAL ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

/* ─── SMOOTH SCROLL ─── */
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─── COUNTER ─── */
function Counter({ to, suffix = "", duration = 1600 }) {
  const [val, setVal] = useState(0);
  const [ref, vis] = useReveal(0.5);
  useEffect(() => {
    if (!vis) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [vis, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── HERO HOUSE ─── */
const PHASE_MS = 280;
const PHASES = 8;

function HeroBuildHouse() {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      let p = 0;
      const iv = setInterval(() => {
        p++;
        setPhase(p);
        if (p >= PHASES) {
          clearInterval(iv);
          setTimeout(() => setDone(true), 200);
        }
      }, PHASE_MS);
      return () => clearInterval(iv);
    }, 600);
    return () => clearTimeout(delay);
  }, []);

  const vis = (min) => ({
    opacity: phase >= min ? 1 : 0,
    transform: phase >= min ? "translateY(0)" : "translateY(6px)",
    transition: `all ${PHASE_MS * 0.7}ms cubic-bezier(0.34,1.56,0.64,1)`,
  });
  const draw = (min) => ({
    strokeDasharray: 300,
    strokeDashoffset: phase >= min ? 0 : 300,
    transition: `stroke-dashoffset ${PHASE_MS}ms ease-out`,
  });
  const pop = (min, delay = 0) => ({
    opacity: phase >= min ? 1 : 0,
    transform: phase >= min ? "scale(1)" : "scale(0)",
    transition: `all ${PHASE_MS * 0.55}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
    transformOrigin: "center center",
  });

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox="0 0 400 300" width="100%" style={{
        maxWidth: "460px", overflow: "visible",
        filter: done ? "drop-shadow(0 16px 40px rgba(0,0,0,0.4))" : "none",
        transition: "filter 600ms ease",
      }}>
        <line x1="50" y1="260" x2="350" y2="260" stroke={T.tanGhost} strokeWidth="1" style={draw(0)} />
        <ellipse cx="200" cy="264" rx="140" ry="6" fill={T.tanFaded} style={vis(0)} />
        <rect x="90" y="248" width="220" height="12" rx="2"
          fill={phase >= 1 ? T.tanFaded : "none"} stroke={T.tan} strokeWidth="1.5"
          strokeDasharray={phase >= 2 ? "none" : "4,3"}
          style={{ ...vis(1), transition: `all ${PHASE_MS}ms ease` }} />
        <line x1="96" y1="248" x2="96" y2="165" stroke={T.tan} strokeWidth={phase >= 3 ? 2 : 1} strokeDasharray={phase >= 3 ? "none" : "4,3"} style={draw(2)} />
        <line x1="304" y1="248" x2="304" y2="165" stroke={T.tan} strokeWidth={phase >= 3 ? 2 : 1} strokeDasharray={phase >= 3 ? "none" : "4,3"} style={draw(2)} />
        <line x1="88" y1="165" x2="312" y2="165" stroke={T.tan} strokeWidth={phase >= 3 ? 2 : 1} strokeDasharray={phase >= 3 ? "none" : "4,3"} style={draw(3)} />
        <rect x="96" y="165" width="208" height="83" fill={phase >= 3 ? T.tanFaded : "transparent"} style={{ transition: `fill ${PHASE_MS}ms ease` }} />
        <line x1="96" y1="165" x2="150" y2="210" stroke={T.tanFaded} strokeWidth="0.8" style={draw(3)} />
        <line x1="304" y1="165" x2="250" y2="210" stroke={T.tanFaded} strokeWidth="0.8" style={draw(3)} />
        <line x1="75" y1="168" x2="200" y2="82" stroke={T.terra} strokeWidth={phase >= 5 ? 2.5 : 1.5} strokeDasharray={phase >= 5 ? "none" : "5,4"} style={draw(4)} />
        <line x1="325" y1="168" x2="200" y2="82" stroke={T.terra} strokeWidth={phase >= 5 ? 2.5 : 1.5} strokeDasharray={phase >= 5 ? "none" : "5,4"} style={draw(4)} />
        <polygon points="200,82 75,168 325,168" fill={phase >= 5 ? T.terraFaded : "transparent"} style={{ transition: `fill ${PHASE_MS}ms ease` }} />
        <line x1="140" y1="124" x2="260" y2="124" stroke={T.terraGlow} strokeWidth="0.8" style={draw(5)} />
        <g style={vis(5)}>
          <rect x="255" y="86" width="18" height="42" rx="2" fill={T.bgCard} stroke={T.tan} strokeWidth="1.2" />
          <line x1="251" y1="86" x2="276" y2="86" stroke={T.tan} strokeWidth="2" />
        </g>
        {done && (
          <>
            <circle cx="264" cy="74" r="3.5" fill="rgba(196,168,130,0.08)">
              <animate attributeName="cy" values="74;48" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.12;0" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="r" values="3.5;9" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="268" cy="64" r="2.5" fill="rgba(196,168,130,0.06)">
              <animate attributeName="cy" values="64;32" dur="3.2s" repeatCount="indefinite" begin="0.7s" />
              <animate attributeName="opacity" values="0.1;0" dur="3.2s" repeatCount="indefinite" begin="0.7s" />
              <animate attributeName="r" values="2.5;8" dur="3.2s" repeatCount="indefinite" begin="0.7s" />
            </circle>
          </>
        )}
        <g style={pop(6, 0)}>
          <rect x="118" y="188" width="36" height="36" rx="3" fill={T.tanFaded} stroke={T.tan} strokeWidth="1.2" />
          <line x1="136" y1="188" x2="136" y2="224" stroke={T.tan} strokeWidth="0.8" />
          <line x1="118" y1="206" x2="154" y2="206" stroke={T.tan} strokeWidth="0.8" />
          {done && (
            <rect x="119" y="189" width="34" height="34" rx="2.5" fill={T.terraGlow}>
              <animate attributeName="opacity" values="0.25;0.55;0.25" dur="4s" repeatCount="indefinite" />
            </rect>
          )}
        </g>
        <g style={pop(6, 100)}>
          <rect x="246" y="188" width="36" height="36" rx="3" fill={T.tanFaded} stroke={T.tan} strokeWidth="1.2" />
          <line x1="264" y1="188" x2="264" y2="224" stroke={T.tan} strokeWidth="0.8" />
          <line x1="246" y1="206" x2="282" y2="206" stroke={T.tan} strokeWidth="0.8" />
          {done && (
            <rect x="247" y="189" width="34" height="34" rx="2.5" fill={T.terraGlow}>
              <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4.5s" repeatCount="indefinite" begin="1s" />
            </rect>
          )}
        </g>
        <g style={pop(6, 180)}>
          <rect x="178" y="202" width="44" height="46" rx="4" fill={T.terraFaded} stroke={T.terra} strokeWidth="1.2" />
          <path d="M178,214 Q200,202 222,214" fill="none" stroke={T.tanGhost} strokeWidth="0.8" />
          <circle cx="213" cy="228" r="2.5" fill={T.terra} style={pop(7, 60)} />
        </g>
        <rect x="172" y="248" width="56" height="5" rx="1.5" fill={T.tanGhost} style={vis(7)} />
        <g style={vis(7)}>
          <line x1="188" y1="253" x2="178" y2="275" stroke={T.tanGhost} strokeWidth="0.8" strokeDasharray="3,3" />
          <line x1="212" y1="253" x2="222" y2="275" stroke={T.tanGhost} strokeWidth="0.8" strokeDasharray="3,3" />
        </g>
        <g style={pop(7, 200)}>
          <line x1="55" y1="258" x2="55" y2="228" stroke={T.olive} strokeWidth="2" opacity="0.5" />
          <circle cx="55" cy="222" r="12" fill={T.oliveFaded} stroke={T.oliveGlow} strokeWidth="0.6" />
          <circle cx="55" cy="215" r="8" fill={T.oliveFaded} />
        </g>
        <g style={pop(7, 320)}>
          <line x1="350" y1="258" x2="350" y2="232" stroke={T.olive} strokeWidth="2" opacity="0.5" />
          <circle cx="350" cy="226" r="10" fill={T.oliveFaded} stroke={T.oliveGlow} strokeWidth="0.6" />
          <circle cx="350" cy="220" r="7" fill={T.oliveFaded} />
        </g>
        <ellipse cx="120" cy="258" rx="14" ry="6" fill={T.oliveFaded} style={pop(7, 250)} />
        <ellipse cx="290" cy="258" rx="12" ry="5" fill={T.oliveFaded} style={pop(7, 300)} />
        <g style={{ opacity: phase >= 2 && phase < 5 ? 0.35 : 0, transition: "opacity 300ms ease" }}>
          <line x1="96" y1="270" x2="304" y2="270" stroke={T.tan} strokeWidth="0.4" />
          <line x1="96" y1="267" x2="96" y2="273" stroke={T.tan} strokeWidth="0.4" />
          <line x1="304" y1="267" x2="304" y2="273" stroke={T.tan} strokeWidth="0.4" />
          <text x="200" y="280" textAnchor="middle" fontSize="8" fill={T.dim} fontFamily="'DM Mono', monospace">208'</text>
        </g>
      </svg>
      <div style={{
        display: "flex", gap: "6px", justifyContent: "center", marginTop: "16px",
        opacity: done ? 0 : 0.6, transition: "opacity 400ms ease",
      }}>
        {Array.from({ length: PHASES }).map((_, i) => (
          <div key={i} style={{
            width: "4px", height: "4px", borderRadius: "50%",
            background: i <= phase ? T.terra : T.tanGhost,
            transform: i <= phase ? "scale(1)" : "scale(0.6)",
            transition: `all ${PHASE_MS * 0.5}ms ease ${i * 30}ms`,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─── FEATURE CARD ─── */
function FeatureCard({ icon, title, desc, delay, accent, linkTo }) {
  const [ref, vis] = useReveal(0.15);
  const [hov, setHov] = useState(false);
  const navigate = useNavigate();
  const ac = accent === "olive" ? T.olive : T.terra;
  const ag = accent === "olive" ? T.oliveGlow : T.terraGlow;
  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => linkTo && navigate(linkTo)}
      style={{
        background: T.bgCard, borderRadius: "14px", padding: "26px 20px",
        border: `1px solid ${hov ? ac + "55" : T.tanFaded}`,
        opacity: vis ? 1 : 0,
        transform: vis ? (hov ? "translateY(-3px)" : "translateY(0)") : "translateY(28px)",
        transition: `all 550ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        cursor: linkTo ? "pointer" : "default", position: "relative", overflow: "hidden",
        flex: "1 1 260px", minWidth: "240px", maxWidth: "320px",
        boxShadow: hov ? `0 14px 44px rgba(0,0,0,0.3), 0 0 0 1px ${ag}` : "0 4px 14px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{
        position: "absolute", top: "-30px", right: "-30px",
        width: "90px", height: "90px", borderRadius: "50%",
        background: `radial-gradient(circle, ${ag} 0%, transparent 70%)`,
        opacity: hov ? 1 : 0, transition: "opacity 400ms ease",
      }} />
      <div style={{
        fontSize: "26px", marginBottom: "12px",
        transform: hov ? "scale(1.12)" : "scale(1)",
        transition: "transform 350ms cubic-bezier(0.34,1.56,0.64,1)",
      }}>{icon}</div>
      <div style={{ fontSize: "14px", color: T.tan, fontWeight: 500, marginBottom: "6px", position: "relative" }}>{title}</div>
      <div style={{ fontSize: "12px", color: T.mid, lineHeight: 1.65, position: "relative" }}>{desc}</div>
    </div>
  );
}

/* ─── TESTIMONIAL ─── */
function Testimonial({ quote, name, unit, delay }) {
  const [ref, vis] = useReveal(0.15);
  return (
    <div ref={ref} style={{
      background: T.bgCard, borderRadius: "14px", padding: "24px",
      borderLeft: `3px solid ${T.terra}`,
      opacity: vis ? 1 : 0,
      transform: vis ? "translateX(0)" : "translateX(-18px)",
      transition: `all 650ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      flex: "1 1 280px", maxWidth: "380px",
    }}>
      <div style={{ fontSize: "22px", color: T.terraGlow, fontFamily: serif, marginBottom: "6px" }}>"</div>
      <div style={{ fontSize: "13px", color: T.bright, lineHeight: 1.7, fontStyle: "italic", marginBottom: "16px" }}>{quote}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "30px", height: "30px", borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.terra}, ${T.olive})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", color: "#fff", fontWeight: 500,
        }}>{name[0]}</div>
        <div>
          <div style={{ fontSize: "12px", color: T.tan, fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: "10px", color: T.dim }}>{unit}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── STEP CARD ─── */
function StepCard({ num, title, desc, delay }) {
  const [ref, vis] = useReveal(0.15);
  return (
    <div ref={ref} style={{
      display: "flex", gap: "16px", alignItems: "flex-start",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(22px)",
      transition: `all 550ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    }}>
      <div style={{
        minWidth: "38px", height: "38px", borderRadius: "10px",
        background: `linear-gradient(135deg, ${T.terraFaded}, ${T.terraGlow})`,
        border: `1px solid ${T.terra}55`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "15px", fontWeight: 500, color: T.terra, fontFamily: serif,
        boxShadow: `0 0 18px ${T.terraGlow}`,
      }}>{num}</div>
      <div>
        <div style={{ fontSize: "14px", color: T.tan, fontWeight: 500, marginBottom: "4px" }}>{title}</div>
        <div style={{ fontSize: "12px", color: T.mid, lineHeight: 1.6 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ─── STAT ITEM ─── */
function StatItem({ val, suf, label, custom, delay, index }) {
  const [ref, vis] = useReveal(0.3);
  return (
    <div ref={ref} style={{
      flex: 1, maxWidth: "180px", textAlign: "center",
      padding: "18px 10px", background: T.bg,
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(12px)",
      transition: `all 450ms ease ${index * 80}ms`,
    }}>
      <div style={{ fontSize: "26px", fontWeight: 300, color: T.terra, fontFamily: serif }}>
        {custom || <Counter to={val} suffix={suf} />}
      </div>
      <div style={{ fontSize: "9px", letterSpacing: "1.5px", color: T.dim, textTransform: "uppercase", marginTop: "5px" }}>
        {label}
      </div>
    </div>
  );
}

/* ─── SECTION HEADER ─── */
function SectionHeader({ eyebrow, eyebrowColor, headline, mb = "44px" }) {
  const [ref, vis] = useReveal(0.15);
  return (
    <div ref={ref} style={{
      textAlign: "center", marginBottom: mb,
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(18px)",
      transition: "all 550ms ease",
    }}>
      <div style={{ fontSize: "10px", letterSpacing: "4px", color: eyebrowColor || T.terra, textTransform: "uppercase", marginBottom: "10px" }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontFamily: serif, fontWeight: 400, margin: 0 }}
        dangerouslySetInnerHTML={{ __html: headline }}
      />
    </div>
  );
}

/* ─── TESTIMONIALS SECTION ─── */
const FALLBACK_REVIEWS = [
  { id: 'f1', quote: "I used to mail checks to my old landlord. Now I pay from my couch in 10 seconds. Didn't know renting could feel this easy.", display_name: "Marcus T.", unit_label: "Derby Duplex", rating: 5 },
  { id: 'f2', quote: "Kitchen sink backed up at 9 PM. Submitted a request, had a plumber scheduled by morning. That has never happened before.", display_name: "Jasmine R.", unit_label: "Unit 8110", rating: 5 },
]

function TestimonialsSection() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('reviews')
      .select('id, quote, display_name, unit_label, rating')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setReviews(data && data.length > 0 ? data : FALLBACK_REVIEWS)
        setLoading(false)
      })
      .catch(() => {
        setReviews(FALLBACK_REVIEWS)
        setLoading(false)
      })
  }, [])

  const display = loading ? FALLBACK_REVIEWS : reviews

  return (
    <section style={{ padding: "70px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <SectionHeader
        eyebrow="Our Tenants"
        headline={`What it's like to rent <span style="color:${T.olive}">with us</span>.`}
        mb="36px"
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
        {display.map((r, i) => (
          <Testimonial
            key={r.id}
            delay={i * 120}
            quote={r.quote}
            name={r.display_name}
            unit={r.unit_label ? `Tenant — ${r.unit_label}` : 'Verified Tenant'}
          />
        ))}
      </div>
    </section>
  )
}

/* ─── CTA SECTION ─── */
function CTASection() {
  const [ref, vis] = useReveal(0.15);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | error | success
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <div ref={ref} style={{
      maxWidth: "440px", margin: "0 auto", textAlign: "center",
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(22px)",
      transition: "all 650ms ease",
    }}>
      <div style={{ fontSize: "10px", letterSpacing: "4px", color: T.olive, textTransform: "uppercase", marginBottom: "12px" }}>
        Get In Touch
      </div>
      <h2 style={{ fontSize: "clamp(24px,4vw,34px)", fontFamily: serif, fontWeight: 400, margin: "0 0 10px" }}>
        Ready to call it <span style={{ color: T.terra }}>home</span>?
      </h2>
      <p style={{ fontSize: "13px", color: T.mid, lineHeight: 1.7, marginBottom: "28px" }}>
        Drop your email and we'll send you our available units, pricing, and a direct link to apply — usually within one business day.
      </p>

      {status === "success" ? (
        <div style={{
          padding: "20px 24px", borderRadius: "12px",
          background: T.bgCard, border: `1px solid ${T.olive}44`,
          color: T.olive, fontSize: "14px", lineHeight: 1.6,
        }}>
          Thanks! We'll be in touch soon.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "380px", margin: "0 auto" }}>
            <div style={{
              borderRadius: "10px", overflow: "hidden",
              border: `1px solid ${T.tanGhost}`,
              transition: "all 300ms ease",
            }}>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: "100%", padding: "13px 14px", border: "none",
                  background: T.bgCard, color: T.tan, fontSize: "13px",
                  fontFamily: font, outline: "none",
                }}
              />
            </div>
            <div className="cta-form-row">
              <div style={{
                flex: 1, borderRadius: "10px", overflow: "hidden",
                border: `1px solid ${status === "error" ? "#c0392b88" : emailFocused ? T.terra : T.tanGhost}`,
                boxShadow: emailFocused ? `0 0 0 3px ${T.terraFaded}` : "none",
                transition: "all 300ms ease",
              }}>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  style={{
                    width: "100%", padding: "13px 14px", border: "none",
                    background: T.bgCard, color: T.tan, fontSize: "13px",
                    fontFamily: font, outline: "none",
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={status === "sending"}
                style={{
                  padding: "13px 22px", borderRadius: "10px", border: "none",
                  background: status === "sending" ? T.tanGhost : T.terra,
                  color: "#fff", fontSize: "12px",
                  fontFamily: font, fontWeight: 500,
                  cursor: status === "sending" ? "not-allowed" : "pointer",
                  boxShadow: status === "sending" ? "none" : `0 4px 18px ${T.terraGlow}`,
                  transition: "all 200ms ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { if (status !== "sending") e.target.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => e.target.style.transform = "translateY(0)"}
              >{status === "sending" ? "Sending…" : "Send"}</button>
            </div>
          </div>
          {status === "error" && (
            <div style={{ fontSize: "11px", color: "#e74c3c", marginTop: "6px", textAlign: "left", maxWidth: "380px", margin: "6px auto 0" }}>
              {errorMsg}
            </div>
          )}
        </>
      )}
      <div style={{ fontSize: "9px", color: T.dim, marginTop: "10px" }}>
        One email with available units + application link. No spam, ever.
      </div>
    </div>
  );
}

/* ─── HAMBURGER MENU ─── */
function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleNavItem(item) {
    setOpen(false);
    if (item === "Contact") {
      navigate("/about#contact");
    } else if (item === "Tenants") {
      navigate("/tenant/dashboard");
    } else if (item === "Properties") {
      navigate("/properties");
    } else if (item === "About") {
      navigate("/about");
    }
  }

  return (
    <>
      <button
        className="hamburger-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
        style={{
          background: "none", border: "none", cursor: "pointer",
          display: "none", flexDirection: "column", gap: "5px",
          padding: "6px", marginRight: "4px",
        }}
      >
        <span style={{ display: "block", width: "20px", height: "1.5px", background: open ? T.terra : T.tan, transition: "all 250ms ease", transform: open ? "rotate(45deg) translateY(6.5px)" : "none" }} />
        <span style={{ display: "block", width: "20px", height: "1.5px", background: open ? T.terra : T.tan, transition: "all 250ms ease", opacity: open ? 0 : 1 }} />
        <span style={{ display: "block", width: "20px", height: "1.5px", background: open ? T.terra : T.tan, transition: "all 250ms ease", transform: open ? "rotate(-45deg) translateY(-6.5px)" : "none" }} />
      </button>

      {open && (
        <div style={{
          position: "fixed", top: "56px", left: 0, right: 0, zIndex: 99,
          background: "rgba(26,22,18,0.97)", backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${T.tanFaded}`,
          padding: "16px 24px 20px",
          display: "flex", flexDirection: "column", gap: "2px",
        }}>
          {["Tenants", "Properties", "About", "Contact"].map(item => (
            <button key={item}
              onClick={() => handleNavItem(item)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                textAlign: "left", padding: "12px 0",
                fontSize: "13px", color: T.mid, letterSpacing: "1px",
                textTransform: "uppercase", borderBottom: `1px solid ${T.tanFaded}`,
                fontFamily: font, transition: "color 200ms ease",
              }}
              onMouseEnter={e => e.currentTarget.style.color = T.tan}
              onMouseLeave={e => e.currentTarget.style.color = T.mid}
            >{item}</button>
          ))}
          <a href="/login" onClick={() => setOpen(false)} style={{
            display: "block", marginTop: "12px", padding: "12px 20px",
            borderRadius: "8px", background: T.terra, color: "#fff",
            textDecoration: "none", fontSize: "12px", fontWeight: 500,
            letterSpacing: "1px", textTransform: "uppercase", textAlign: "center",
          }}>Tenant Login</a>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════ */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navBg = Math.min(scrollY / 200, 1);

  function handleDesktopNav(item) {
    if (item === "Contact") {
      navigate("/about#contact");
    } else if (item === "Tenants") {
      navigate("/tenant/dashboard");
    } else if (item === "Properties") {
      navigate("/properties");
    } else if (item === "About") {
      navigate("/about");
    }
  }

  return (
    <div style={{ background: T.bg, fontFamily: font, color: T.tan, overflowX: "hidden" }}>

      {/* ─── NAV ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 24px", height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: navBg > 0.1 ? `rgba(26,22,18,${0.88 * navBg})` : "transparent",
        backdropFilter: navBg > 0.1 ? "blur(16px)" : "none",
        borderBottom: navBg > 0.5 ? `1px solid ${T.tanFaded}` : "1px solid transparent",
        transition: "all 300ms ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <polygon points="12,3 3,13 21,13" fill="none" stroke={T.terra} strokeWidth="1.8" />
            <rect x="8" y="13" width="8" height="7" fill="none" stroke={T.terra} strokeWidth="1.5" rx="1" />
          </svg>
          <span style={{ fontSize: "12px", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 500 }}>
            In Time Realty
          </span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {["Tenants", "Properties", "About", "Contact"].map((item) => (
            <button key={item} onClick={() => handleDesktopNav(item)} className="nav-link" style={{
              fontSize: "11px", color: T.mid, textDecoration: "none",
              letterSpacing: "1px", textTransform: "uppercase",
              transition: "color 200ms ease", display: "none",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: font, padding: 0,
            }}
              onMouseEnter={e => e.currentTarget.style.color = T.tan}
              onMouseLeave={e => e.currentTarget.style.color = T.mid}
            >{item}</button>
          ))}
          <HamburgerMenu />
          <a href="/login" style={{
            fontSize: "10px", padding: "7px 16px", borderRadius: "6px",
            background: T.terra, color: "#fff", textDecoration: "none",
            letterSpacing: "1px", textTransform: "uppercase", fontWeight: 500,
            boxShadow: `0 0 16px ${T.terraGlow}`,
          }}>Tenant Login</a>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px 40px", position: "relative",
      }}>
        <div style={{
          position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
          background: `radial-gradient(circle, ${T.terraGlow} 0%, transparent 60%)`,
          top: "8%", left: "20%", opacity: 0.25, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: "350px", height: "350px", borderRadius: "50%",
          background: `radial-gradient(circle, ${T.oliveGlow} 0%, transparent 60%)`,
          bottom: "15%", right: "15%", opacity: 0.15, pointerEvents: "none",
        }} />

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "60px", maxWidth: "1000px", width: "100%", flexWrap: "wrap",
        }}>
          {/* Copy */}
          <div style={{ flex: "1 1 340px", maxWidth: "440px" }}>
            <div style={{
              fontSize: "10px", letterSpacing: "5px", textTransform: "uppercase",
              color: T.terra, marginBottom: "14px", fontWeight: 500,
              animation: "fadeDown 700ms ease forwards",
            }}>
              An Omnivation Company
            </div>
            <h1 style={{
              fontSize: "clamp(32px, 5vw, 52px)", fontFamily: serif,
              fontWeight: 400, lineHeight: 1.15, margin: "0 0 18px",
              animation: "fadeUp 700ms ease 150ms forwards", opacity: 0,
            }}>
              Renting made{" "}
              <span style={{ color: T.terra, textDecoration: "underline", textDecorationColor: T.terraGlow, textUnderlineOffset: "5px", textDecorationThickness: "2px" }}>simple</span>,<br />
              living made{" "}
              <span style={{ color: T.olive }}>home</span>.
            </h1>
            <p style={{
              fontSize: "15px", color: T.mid, lineHeight: 1.7, margin: "0 0 28px", maxWidth: "380px",
              animation: "fadeUp 700ms ease 300ms forwards", opacity: 0,
            }}>
              Pay rent, sign leases, and submit maintenance requests — all from one portal built for real people.
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", animation: "fadeUp 700ms ease 450ms forwards", opacity: 0 }}>
              <button
                onClick={() => scrollTo("cta")}
                style={{
                  padding: "13px 28px", borderRadius: "10px",
                  background: T.terra, color: "#fff", border: "none",
                  fontSize: "13px", fontWeight: 500, letterSpacing: "0.5px",
                  boxShadow: `0 4px 20px ${T.terraGlow}`, transition: "transform 200ms ease, box-shadow 200ms ease",
                  cursor: "pointer", fontFamily: font,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${T.terraGlow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 20px ${T.terraGlow}`; }}
              >Apply Now</button>
              <button
                onClick={() => scrollTo("features")}
                style={{
                  padding: "13px 28px", borderRadius: "10px",
                  background: "transparent", color: T.tan, border: `1px solid ${T.tanGhost}`,
                  fontSize: "13px", letterSpacing: "0.5px",
                  transition: "all 200ms ease", cursor: "pointer", fontFamily: font,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.tan; e.currentTarget.style.background = T.tanFaded; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.tanGhost; e.currentTarget.style.background = "transparent"; }}
              >View Properties</button>
            </div>
          </div>

          {/* Animated house */}
          <div style={{ flex: "1 1 360px", maxWidth: "480px", animation: "fadeUp 800ms ease 200ms forwards", opacity: 0 }}>
            <HeroBuildHouse />
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
          opacity: scrollY > 80 ? 0 : 0.35, transition: "opacity 300ms ease",
        }}>
          <div style={{ fontSize: "8px", letterSpacing: "2px", color: T.dim, textTransform: "uppercase" }}>Scroll</div>
          <div style={{ width: "1px", height: "20px", background: `linear-gradient(${T.dim}, transparent)`, animation: "scrollPulse 2s ease infinite" }} />
        </div>
      </section>

      {/* ─── VISITOR SPLIT ─── */}
      <section style={{
        padding: "28px 24px", display: "flex", justifyContent: "center",
        background: T.bgAlt, borderBottom: `1px solid ${T.tanFaded}`,
      }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: T.dim, letterSpacing: "1px", textTransform: "uppercase" }}>I am a</span>
          <button
            onClick={() => scrollTo("cta")}
            style={{
              padding: "9px 22px", borderRadius: "8px", border: `1px solid ${T.terra}`,
              background: T.terraFaded, color: T.terra, fontSize: "11px",
              fontFamily: font, fontWeight: 500, letterSpacing: "1px",
              textTransform: "uppercase", cursor: "pointer", transition: "all 200ms ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.terra; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.terraFaded; e.currentTarget.style.color = T.terra; }}
          >Prospective Tenant</button>
          <span style={{ fontSize: "11px", color: T.dim }}>or</span>
          <a href="/login" style={{
            display: "inline-block", padding: "9px 22px", borderRadius: "8px",
            border: `1px solid ${T.olive}`, background: T.oliveFaded,
            color: T.olive, fontSize: "11px", fontFamily: font, fontWeight: 500,
            letterSpacing: "1px", textTransform: "uppercase", textDecoration: "none",
            transition: "all 200ms ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = T.olive; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.oliveFaded; e.currentTarget.style.color = T.olive; }}
          >Current Tenant</a>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section style={{ padding: "36px 24px", display: "flex", justifyContent: "center", gap: "1px", background: T.tanFaded, flexWrap: "wrap" }}>
        {[
          { val: 100, suf: "%", label: "Occupancy" },
          { val: 4, suf: "+", label: "Years" },
          { val: 24, suf: "/7", label: "Support" },
          { val: 0, label: "Hidden Fees", custom: "$0" },
        ].map((s, i) => (
          <StatItem key={i} index={i} val={s.val} suf={s.suf} label={s.label} custom={s.custom} />
        ))}
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding: "70px 24px", maxWidth: "960px", margin: "0 auto" }}>
        <SectionHeader
          eyebrow="Why In Time"
          headline={`Everything your landlord<br/><span style="color:rgba(196,168,130,0.55)">should</span> already offer.`}
          mb="44px"
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
          <FeatureCard icon="💳" title="One-Tap Rent" accent="terra" delay={0} linkTo="/login"
            desc="Pay rent in seconds. Zelle today, Stripe ACH tomorrow. Set autopay and never think about it again." />
          <FeatureCard icon="📝" title="Digital Leases" accent="olive" delay={80} linkTo="/login"
            desc="Sign your lease from your phone. No printers, no scanning, no driving across town." />
          <FeatureCard icon="🔧" title="Instant Maintenance" accent="terra" delay={160} linkTo="/login"
            desc="Submit a request, track it live, get notified when it's done. No phone tag." />
          <FeatureCard icon="🏠" title="Your Home Hub" accent="olive" delay={240}
            desc="Lease details, payment history, documents — one login, zero confusion." />
          <FeatureCard icon="📊" title="Full History" accent="terra" delay={320}
            desc="Every receipt, every payment, exportable for tax season. Total transparency." />
          <FeatureCard icon="🔒" title="Bank-Level Security" accent="olive" delay={400}
            desc="256-bit encryption. Your data stays yours — we never sell, never share." />
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: "60px 24px", background: T.bgAlt, borderTop: `1px solid ${T.tanFaded}`, borderBottom: `1px solid ${T.tanFaded}` }}>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Getting Started" eyebrowColor={T.olive}
            headline={`Move in, in <span style="color:${T.terra}">three steps</span>.`}
            mb="36px"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <StepCard num="1" delay={0} title="Apply Online" desc="One application, under 10 minutes. We respond within 48 hours." />
            <StepCard num="2" delay={120} title="Sign Your Lease" desc="E-sign from the portal. No printing, no scanning, no office visits." />
            <StepCard num="3" delay={240} title="Move In & Manage" desc="Get your login, set up autopay, and run your rental life from one place." />
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <TestimonialsSection />

      {/* ─── CONTACT INFO ─── */}
      <section id="contact" style={{ padding: "60px 24px", background: T.bgAlt, borderTop: `1px solid ${T.tanFaded}` }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Contact Us"
            eyebrowColor={T.olive}
            headline={`Reach us <span style="color:${T.terra}">anytime</span>.`}
            mb="36px"
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center" }}>
            {[
              { icon: "✉️", label: "Email", value: "intimer.e@gmail.com", href: "mailto:intimer.e@gmail.com" },
              { icon: "📍", label: "Location", value: "Wichita, KS", href: null },
            ].map(({ icon, label, value, href }) => (
              <div key={label} style={{
                background: T.bgCard, borderRadius: "14px", padding: "22px 28px",
                border: `1px solid ${T.tanFaded}`, textAlign: "center",
                flex: "1 1 180px", minWidth: "160px", maxWidth: "220px",
              }}>
                <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
                <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.dim, textTransform: "uppercase", marginBottom: "6px" }}>{label}</div>
                {href ? (
                  <a href={href} style={{ fontSize: "13px", color: T.tan, textDecoration: "none", transition: "color 200ms ease" }}
                    onMouseEnter={e => e.target.style.color = T.terra}
                    onMouseLeave={e => e.target.style.color = T.tan}
                  >{value}</a>
                ) : (
                  <div style={{ fontSize: "13px", color: T.tan }}>{value}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="cta" style={{ padding: "60px 24px", background: `linear-gradient(180deg, ${T.bg}, ${T.bgAlt})`, borderTop: `1px solid ${T.tanFaded}` }}>
        <CTASection />
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: "36px 24px 24px", borderTop: `1px solid ${T.tanFaded}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            <polygon points="12,3 3,13 21,13" fill="none" stroke={T.terra} strokeWidth="1.8" />
            <rect x="8" y="13" width="8" height="7" fill="none" stroke={T.terra} strokeWidth="1.5" rx="1" />
          </svg>
          <span style={{ fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", color: T.tanSoft }}>
            In Time Realty
          </span>
        </div>
        <div style={{ fontSize: "9px", color: T.dim, letterSpacing: "1px" }}>An Omnivation Company — Wichita, KS</div>
        <div style={{ display: "flex", gap: "20px" }}>
          {[
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Contact", href: "mailto:intimer.e@gmail.com" },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{
              fontSize: "9px", color: T.dim, textDecoration: "none",
              letterSpacing: "1px", textTransform: "uppercase", transition: "color 200ms ease",
            }}
              onMouseEnter={e => e.target.style.color = T.tan}
              onMouseLeave={e => e.target.style.color = T.dim}
            >{label}</a>
          ))}
        </div>
        <div style={{ fontSize: "8px", color: T.dim }}>© 2026 In Time Realty. All rights reserved.</div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:wght@400;500&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        input::placeholder { color: ${T.dim}; }
        @keyframes fadeUp { 0% { opacity:0; transform:translateY(22px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes fadeDown { 0% { opacity:0; transform:translateY(-10px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes scrollPulse { 0%,100% { opacity:0.3; } 50% { opacity:0.6; } }

        /* Desktop nav links */
        @media (min-width: 640px) { .nav-link { display: inline !important; } }

        /* Hamburger: show only below 640px */
        @media (max-width: 639px) { .hamburger-btn { display: flex !important; } }

        /* CTA form: stack on mobile */
        .cta-form-row {
          display: flex;
          gap: 8px;
          max-width: 380px;
          margin: 0 auto;
        }
        @media (max-width: 480px) {
          .cta-form-row {
            flex-direction: column;
          }
          .cta-form-row button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
