import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import T from "../lib/theme";

const font = "'DM Sans', 'Avenir Next', sans-serif";
const serif = "'Playfair Display', 'Georgia', serif";

export default function AboutContactPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#contact") {
      const el = document.getElementById("contact");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  return (
    <div style={{ background: T.bg, fontFamily: font, color: T.tan, minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 24px", height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(26,22,18,0.97)", backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${T.tanFaded}`,
      }}>
        <button onClick={() => navigate("/")} style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "none", border: "none", cursor: "pointer",
          color: T.tan, fontFamily: font,
        }}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <polygon points="12,3 3,13 21,13" fill="none" stroke={T.terra} strokeWidth="1.8" />
            <rect x="8" y="13" width="8" height="7" fill="none" stroke={T.terra} strokeWidth="1.5" rx="1" />
          </svg>
          <span style={{ fontSize: "12px", letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 500 }}>
            In Time Realty
          </span>
        </button>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button onClick={() => navigate("/properties")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "11px", color: T.mid, letterSpacing: "1px",
            textTransform: "uppercase", fontFamily: font,
            transition: "color 200ms ease",
          }}
            onMouseEnter={e => e.currentTarget.style.color = T.tan}
            onMouseLeave={e => e.currentTarget.style.color = T.mid}
          >Properties</button>
          <button onClick={() => {
            const el = document.getElementById("contact");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "11px", color: T.mid, letterSpacing: "1px",
            textTransform: "uppercase", fontFamily: font,
            transition: "color 200ms ease",
          }}
            onMouseEnter={e => e.currentTarget.style.color = T.tan}
            onMouseLeave={e => e.currentTarget.style.color = T.mid}
          >Contact</button>
          <a href="/login" style={{
            fontSize: "10px", padding: "7px 16px", borderRadius: "6px",
            background: T.terra, color: "#fff", textDecoration: "none",
            letterSpacing: "1px", textTransform: "uppercase", fontWeight: 500,
          }}>Tenant Login</a>
        </div>
      </nav>

      {/* ABOUT */}
      <section style={{ padding: "120px 24px 80px", maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ fontSize: "10px", letterSpacing: "4px", color: T.terra, textTransform: "uppercase", marginBottom: "14px" }}>
          About Us
        </div>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontFamily: serif, fontWeight: 400, margin: "0 0 20px" }}>
          An Omnivation Company
        </h1>
        <p style={{ fontSize: "15px", color: T.mid, lineHeight: 1.8, marginBottom: "20px" }}>
          In Time Realty is a Wichita, KS–based property management company dedicated to making renting simple, transparent, and human.
        </p>
        <p style={{ fontSize: "15px", color: T.mid, lineHeight: 1.8, marginBottom: "20px" }}>
          We built our own tenant portal so that paying rent, signing leases, and requesting maintenance is as easy as it should be — no phone tag, no paper, no hassle.
        </p>
        <p style={{ fontSize: "15px", color: T.mid, lineHeight: 1.8 }}>
          Every tenant matters. Every unit is cared for. That's the standard we hold ourselves to.
        </p>
      </section>

      {/* DIVIDER */}
      <div style={{ maxWidth: "700px", margin: "0 auto 0", borderTop: `1px solid ${T.tanFaded}` }} />

      {/* CONTACT */}
      <section id="contact" style={{ padding: "80px 24px 100px", maxWidth: "700px", margin: "0 auto" }}>
        <div style={{ fontSize: "10px", letterSpacing: "4px", color: T.olive, textTransform: "uppercase", marginBottom: "14px" }}>
          Contact
        </div>
        <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontFamily: serif, fontWeight: 400, margin: "0 0 16px" }}>
          Reach us <span style={{ color: T.terra }}>anytime</span>.
        </h2>
        <p style={{ fontSize: "15px", color: T.mid, lineHeight: 1.8, marginBottom: "40px" }}>
          Questions about availability, applications, or your tenancy — we respond within one business day.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
          {[
            { icon: "✉️", label: "Email", value: "intimer.e@gmail.com", href: "mailto:intimer.e@gmail.com" },
            { icon: "📍", label: "Location", value: "Wichita, KS", href: null },
          ].map(({ icon, label, value, href }) => (
            <div key={label} style={{
              background: T.bgCard, borderRadius: "14px", padding: "24px 32px",
              border: `1px solid ${T.tanFaded}`, textAlign: "center",
              flex: "1 1 180px", minWidth: "160px", maxWidth: "240px",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>{icon}</div>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: T.dim, textTransform: "uppercase", marginBottom: "6px" }}>{label}</div>
              {href ? (
                <a href={href} style={{ fontSize: "14px", color: T.tan, textDecoration: "none", transition: "color 200ms ease" }}
                  onMouseEnter={e => e.target.style.color = T.terra}
                  onMouseLeave={e => e.target.style.color = T.tan}
                >{value}</a>
              ) : (
                <div style={{ fontSize: "14px", color: T.tan }}>{value}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:wght@400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
