import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import T from "../lib/theme";

const font = "'DM Sans', 'Avenir Next', sans-serif";
const serif = "'Playfair Display', 'Georgia', serif";

function PropertyCard({ prop }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.bgCard, borderRadius: "14px", overflow: "hidden",
        border: `1px solid ${hov ? T.terra + "55" : T.tanFaded}`,
        transition: "all 300ms ease",
        boxShadow: hov ? `0 14px 40px rgba(0,0,0,0.25)` : "0 4px 14px rgba(0,0,0,0.1)",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        flex: "1 1 300px", minWidth: "280px", maxWidth: "380px",
      }}
    >
      {prop.image_url ? (
        <img src={prop.image_url} alt={prop.title}
          style={{ width: "100%", height: "200px", objectFit: "cover" }} />
      ) : (
        <div style={{
          width: "100%", height: "160px",
          background: `linear-gradient(135deg, ${T.terraFaded}, ${T.oliveFaded})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg viewBox="0 0 24 24" width="40" height="40" opacity="0.3">
            <polygon points="12,3 3,13 21,13" fill="none" stroke={T.terra} strokeWidth="1.5" />
            <rect x="8" y="13" width="8" height="7" fill="none" stroke={T.terra} strokeWidth="1.3" rx="1" />
          </svg>
        </div>
      )}
      <div style={{ padding: "20px" }}>
        <div style={{ fontSize: "16px", color: T.tan, fontFamily: serif, fontWeight: 400, marginBottom: "6px" }}>
          {prop.title}
        </div>
        {prop.address && (
          <div style={{ fontSize: "12px", color: T.dim, marginBottom: "12px" }}>{prop.address}</div>
        )}
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
          {prop.bedrooms != null && (
            <span style={{ fontSize: "12px", color: T.mid }}>🛏 {prop.bedrooms} bed</span>
          )}
          {prop.bathrooms != null && (
            <span style={{ fontSize: "12px", color: T.mid }}>🚿 {prop.bathrooms} bath</span>
          )}
          {prop.available_date && (
            <span style={{ fontSize: "12px", color: T.mid }}>
              📅 Available {new Date(prop.available_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
        {prop.description && (
          <p style={{ fontSize: "13px", color: T.mid, lineHeight: 1.65, marginBottom: "16px" }}>
            {prop.description}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {prop.rent_amount ? (
            <div style={{ fontSize: "18px", color: T.terra, fontFamily: serif }}>
              ${prop.rent_amount.toLocaleString()}<span style={{ fontSize: "11px", color: T.dim }}>/mo</span>
            </div>
          ) : <div />}
          <a href="mailto:intimer.e@gmail.com?subject=Property Inquiry" style={{
            padding: "9px 18px", borderRadius: "8px",
            background: T.terra, color: "#fff", textDecoration: "none",
            fontSize: "11px", fontWeight: 500, letterSpacing: "0.5px",
            fontFamily: font, transition: "opacity 200ms ease",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >Inquire</a>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProperties(data || []);
        setLoading(false);
      });
  }, []);

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
          <button onClick={() => navigate("/about")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "11px", color: T.mid, letterSpacing: "1px",
            textTransform: "uppercase", fontFamily: font, transition: "color 200ms ease",
          }}
            onMouseEnter={e => e.currentTarget.style.color = T.tan}
            onMouseLeave={e => e.currentTarget.style.color = T.mid}
          >About</button>
          <button onClick={() => navigate("/about#contact")} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "11px", color: T.mid, letterSpacing: "1px",
            textTransform: "uppercase", fontFamily: font, transition: "color 200ms ease",
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

      <section style={{ padding: "120px 24px 80px", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ fontSize: "10px", letterSpacing: "4px", color: T.terra, textTransform: "uppercase", marginBottom: "14px" }}>
          Available Now
        </div>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontFamily: serif, fontWeight: 400, margin: "0 0 40px" }}>
          Find your next <span style={{ color: T.terra }}>home</span>.
        </h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: T.dim, fontSize: "14px" }}>
            Loading...
          </div>
        ) : properties.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            background: T.bgCard, borderRadius: "16px",
            border: `1px solid ${T.tanFaded}`,
          }}>
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>🏠</div>
            <div style={{ fontSize: "18px", fontFamily: serif, color: T.tan, marginBottom: "10px" }}>
              No units available right now.
            </div>
            <p style={{ fontSize: "13px", color: T.mid, lineHeight: 1.7, marginBottom: "24px" }}>
              Join the waitlist — we'll email you as soon as something opens up.
            </p>
            <a href="mailto:intimer.e@gmail.com?subject=Waitlist" style={{
              display: "inline-block", padding: "11px 24px", borderRadius: "8px",
              background: T.terra, color: "#fff", textDecoration: "none",
              fontSize: "12px", fontWeight: 500, letterSpacing: "0.5px", fontFamily: font,
            }}>Join Waitlist</a>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            {properties.map(p => <PropertyCard key={p.id} prop={p} />)}
          </div>
        )}
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=Playfair+Display:wght@400;500&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
