import { useNavigate } from "react-router-dom";
import T from "../lib/theme";

const font = "'DM Sans', 'Avenir Next', sans-serif";
const serif = "'Playfair Display', 'Georgia', serif";

export default function TermsPage() {
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
          display: "flex", alignItems: "center", gap: "none", gap: "8px",
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
          Legal
        </div>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontFamily: serif, fontWeight: 400, margin: "0 0 20px" }}>
          Terms of Service
        </h1>
        <p style={{ fontSize: "13px", color: T.dim, marginBottom: "32px" }}>Last updated: April 2026</p>

        {[
          {
            title: "Use of This Site",
            body: "This website is operated by In Time Realty, an Omnivation Company. By using this site, you agree to these terms. The site is intended for prospective and current tenants seeking housing in the Wichita, KS area.",
          },
          {
            title: "Tenant Portal",
            body: "Access to the tenant portal is granted to verified tenants only. You are responsible for maintaining the security of your login credentials. Unauthorized access is prohibited.",
          },
          {
            title: "Accuracy of Information",
            body: "We strive to keep property and availability information current, but cannot guarantee real-time accuracy. Confirm details directly with us before making decisions.",
          },
          {
            title: "Limitation of Liability",
            body: "In Time Realty is not liable for any indirect, incidental, or consequential damages arising from use of this site or tenant portal.",
          },
          {
            title: "Contact",
            body: "Questions about these terms? Email us at intimer.e@gmail.com.",
          },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "16px", fontFamily: serif, fontWeight: 400, color: T.tan, margin: "0 0 8px" }}>{title}</h2>
            <p style={{ fontSize: "14px", color: T.mid, lineHeight: 1.75, margin: 0 }}>{body}</p>
          </div>
        ))}
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:wght@400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
