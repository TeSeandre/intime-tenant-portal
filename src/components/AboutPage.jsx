import { useNavigate } from "react-router-dom";
import T from "../lib/theme";

const font = "'DM Sans', 'Avenir Next', sans-serif";
const serif = "'Playfair Display', 'Georgia', serif";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: T.bg, fontFamily: font, color: T.tan, minHeight: "100vh" }}>
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
        <a href="/login" style={{
          fontSize: "10px", padding: "7px 16px", borderRadius: "6px",
          background: T.terra, color: "#fff", textDecoration: "none",
          letterSpacing: "1px", textTransform: "uppercase", fontWeight: 500,
        }}>Tenant Login</a>
      </nav>

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
          More detail coming soon. In the meantime, reach us at{" "}
          <a href="mailto:hello@intime.rentals" style={{ color: T.terra, textDecoration: "none" }}>
            hello@intime.rentals
          </a>.
        </p>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:wght@400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
