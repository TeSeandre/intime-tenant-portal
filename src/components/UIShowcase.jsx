import { useState, useEffect, useRef } from "react";

/* ─── THEME ─── */
const T = {
  bg: "#1A1612",
  bgCard: "#211C17",
  bgHover: "#2A241D",
  tan: "#C4A882",
  tanFaded: "rgba(196,168,130,0.12)",
  tanGhost: "rgba(196,168,130,0.25)",
  tanSoft: "rgba(196,168,130,0.5)",
  terra: "#C2703E",
  terraGlow: "rgba(194,112,62,0.2)",
  terraFaded: "rgba(194,112,62,0.1)",
  olive: "#6B8455",
  oliveGlow: "rgba(107,132,85,0.2)",
  oliveFaded: "rgba(107,132,85,0.12)",
  textDim: "rgba(196,168,130,0.35)",
  textMid: "rgba(196,168,130,0.6)",
  success: "#6B8455",
  warning: "#C2703E",
};

const font = "'DM Sans', 'Avenir', sans-serif";
const mono = "'DM Mono', 'SF Mono', monospace";

/* ─── 1. PAYMENT SUCCESS ANIMATION ─── */
function PaymentSuccess() {
  const [state, setState] = useState("idle");

  const trigger = () => {
    setState("processing");
    setTimeout(() => setState("success"), 1800);
    setTimeout(() => setState("idle"), 5000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <button
        onClick={state === "idle" ? trigger : undefined}
        style={{
          padding: "14px 36px", borderRadius: "10px", border: "none",
          fontFamily: font, fontSize: "14px", fontWeight: 500, cursor: state === "idle" ? "pointer" : "default",
          letterSpacing: "0.5px", position: "relative", overflow: "hidden",
          background: state === "success" ? T.olive : state === "processing" ? T.bgHover : T.terra,
          color: state === "success" ? "#fff" : state === "processing" ? T.tanSoft : "#fff",
          transition: "all 500ms cubic-bezier(0.34,1.56,0.64,1)",
          transform: state === "success" ? "scale(1.05)" : "scale(1)",
          boxShadow: state === "success"
            ? `0 0 30px ${T.oliveGlow}, 0 4px 15px rgba(0,0,0,0.3)`
            : `0 4px 15px rgba(0,0,0,0.2)`,
        }}
      >
        {state === "processing" && (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(90deg, transparent, ${T.tanFaded}, transparent)`,
            animation: "shimmer 1.2s ease infinite",
          }} />
        )}
        <span style={{ position: "relative", zIndex: 1 }}>
          {state === "idle" && "Pay $1,450.00"}
          {state === "processing" && "Processing..."}
          {state === "success" && "✓ Payment Confirmed"}
        </span>
      </button>

      <div style={{
        width: "260px", borderRadius: "10px", overflow: "hidden",
        background: T.bgCard, border: `1px solid ${T.tanFaded}`,
        maxHeight: state === "success" ? "200px" : "0",
        opacity: state === "success" ? 1 : 0,
        transition: "all 600ms cubic-bezier(0.34,1.56,0.64,1) 200ms",
        padding: state === "success" ? "16px" : "0 16px",
      }}>
        <div style={{ fontSize: "10px", letterSpacing: "2px", color: T.textDim, textTransform: "uppercase", marginBottom: "12px" }}>
          Receipt
        </div>
        {[
          ["Amount", "$1,450.00"],
          ["Method", "Zelle"],
          ["Date", "Apr 4, 2026"],
          ["Unit", "8110 E 34th Ct S"],
        ].map(([label, val], i) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", padding: "6px 0",
            borderBottom: i < 3 ? `1px solid ${T.tanFaded}` : "none",
            opacity: state === "success" ? 1 : 0,
            transform: state === "success" ? "translateX(0)" : "translateX(-10px)",
            transition: `all 400ms ease ${300 + i * 100}ms`,
          }}>
            <span style={{ fontSize: "12px", color: T.textMid }}>{label}</span>
            <span style={{ fontSize: "12px", color: T.tan, fontFamily: mono }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 2. ANIMATED STAT COUNTERS ─── */
function AnimCounter({ target, prefix = "", suffix = "", duration = 1600, color }) {
  const [val, setVal] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, target, duration]);

  return (
    <div ref={ref} style={{
      textAlign: "center",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(15px)",
      transition: "all 600ms ease",
    }}>
      <div style={{
        fontSize: "32px", fontWeight: 300, color: color || T.tan,
        fontFamily: mono, lineHeight: 1,
      }}>
        {prefix}{val.toLocaleString()}{suffix}
      </div>
    </div>
  );
}

function StatsRow() {
  return (
    <div style={{
      display: "flex", gap: "1px", borderRadius: "12px", overflow: "hidden",
      background: T.tanFaded, width: "100%",
    }}>
      {[
        { target: 1450, prefix: "$", label: "Rent Due", color: T.terra },
        { target: 12, label: "Months On Time", color: T.olive },
        { target: 847, label: "Credit Score Pts", suffix: "+", color: T.tan },
      ].map((stat, i) => (
        <div key={i} style={{
          flex: 1, background: T.bgCard, padding: "20px 12px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
        }}>
          <AnimCounter target={stat.target} prefix={stat.prefix} suffix={stat.suffix} color={stat.color} duration={1400 + i * 200} />
          <div style={{ fontSize: "10px", letterSpacing: "1.5px", color: T.textDim, textTransform: "uppercase" }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── 3. MAINTENANCE REQUEST TRACKER ─── */
function MaintenanceTracker() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { label: "Submitted", icon: "📋", detail: "Mar 28, 9:14 AM" },
    { label: "Reviewed", icon: "👁", detail: "Mar 28, 2:30 PM" },
    { label: "Scheduled", icon: "🔧", detail: "Mar 31, 10:00 AM" },
    { label: "Completed", icon: "✓", detail: "Pending" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s >= 3 ? 0 : s + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: T.bgCard, borderRadius: "12px", padding: "20px",
      border: `1px solid ${T.tanFaded}`, width: "100%",
    }}>
      <div style={{
        fontSize: "10px", letterSpacing: "2px", color: T.textDim,
        textTransform: "uppercase", marginBottom: "6px",
      }}>Maintenance Request #1042</div>
      <div style={{ fontSize: "13px", color: T.tan, marginBottom: "20px" }}>
        Kitchen faucet leak — Unit 8110
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", position: "relative", padding: "0 8px" }}>
        <div style={{
          position: "absolute", top: "16px", left: "24px", right: "24px",
          height: "2px", background: T.tanFaded,
        }}>
          <div style={{
            height: "100%", background: `linear-gradient(90deg, ${T.olive}, ${T.terra})`,
            width: `${(activeStep / 3) * 100}%`,
            transition: "width 600ms cubic-bezier(0.34,1.56,0.64,1)",
            borderRadius: "2px",
            boxShadow: `0 0 8px ${T.terraGlow}`,
          }} />
        </div>

        {steps.map((step, i) => (
          <div key={i} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: "8px", position: "relative", zIndex: 1,
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: i === 3 && activeStep >= 3 ? "14px" : "13px",
              background: i <= activeStep ? (i === activeStep ? T.terra : T.olive) : T.bgHover,
              border: `2px solid ${i <= activeStep ? (i === activeStep ? T.terra : T.olive) : T.tanGhost}`,
              color: i <= activeStep ? "#fff" : T.textDim,
              transition: "all 400ms cubic-bezier(0.34,1.56,0.64,1)",
              transform: i === activeStep ? "scale(1.15)" : "scale(1)",
              boxShadow: i === activeStep ? `0 0 16px ${T.terraGlow}` : "none",
            }}>
              {step.icon}
            </div>
            <div style={{
              fontSize: "10px", letterSpacing: "0.5px", textAlign: "center",
              color: i <= activeStep ? T.tan : T.textDim,
              fontWeight: i === activeStep ? 500 : 400,
              transition: "all 300ms ease",
            }}>
              {step.label}
            </div>
            <div style={{
              fontSize: "9px", color: T.textDim, fontFamily: mono,
              opacity: i <= activeStep ? 1 : 0.4,
              transition: "opacity 300ms ease",
            }}>
              {step.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 4. ANIMATED NAVIGATION TABS ─── */
function NavTabs() {
  const [active, setActive] = useState(0);
  const tabs = ["Dashboard", "Payments", "Lease", "Maintenance", "Documents"];
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[active];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  return (
    <div style={{
      background: T.bgCard, borderRadius: "10px", padding: "4px",
      border: `1px solid ${T.tanFaded}`, position: "relative",
      display: "flex", gap: "2px", width: "100%", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "4px", bottom: "4px",
        left: `${indicator.left}px`, width: `${indicator.width}px`,
        background: `linear-gradient(135deg, ${T.terraFaded}, ${T.terraGlow})`,
        borderRadius: "8px", border: `1px solid ${T.terra}`,
        transition: "all 350ms cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: `0 0 20px ${T.terraGlow}`,
      }} />

      {tabs.map((tab, i) => (
        <button key={tab} ref={(el) => (tabRefs.current[i] = el)}
          onClick={() => setActive(i)}
          style={{
            flex: 1, padding: "10px 8px", borderRadius: "8px",
            border: "none", background: "transparent", cursor: "pointer",
            fontSize: "11px", letterSpacing: "0.5px", fontFamily: font,
            color: active === i ? T.tan : T.textDim,
            fontWeight: active === i ? 500 : 400,
            position: "relative", zIndex: 1,
            transition: "color 300ms ease",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

/* ─── 5. NOTIFICATION TOAST ─── */
function ToastDemo() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const types = [
    { msg: "Rent payment received — $1,450.00", type: "success", icon: "✓" },
    { msg: "Lease renewal available for review", type: "info", icon: "📄" },
    { msg: "Maintenance visit scheduled for Apr 8", type: "warning", icon: "🔧" },
  ];

  const addToast = () => {
    const t = types[idRef.current % types.length];
    const id = idRef.current++;
    setToasts((prev) => [...prev, { ...t, id, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((x) => (x.id === id ? { ...x, exiting: true } : x)));
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 400);
    }, 3000);
  };

  const borderColor = (type) =>
    type === "success" ? T.olive : type === "warning" ? T.terra : T.tan;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}>
      <button onClick={addToast} style={{
        padding: "10px 24px", borderRadius: "8px",
        border: `1px solid ${T.tanGhost}`, background: "transparent",
        color: T.tan, fontSize: "12px", letterSpacing: "1px",
        fontFamily: font, cursor: "pointer", textTransform: "uppercase",
      }}>
        Trigger Notification
      </button>

      <div style={{
        position: "relative", width: "100%", minHeight: "60px",
        display: "flex", flexDirection: "column", gap: "8px", alignItems: "center",
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: T.bgCard, borderRadius: "10px", padding: "12px 16px",
            borderLeft: `3px solid ${borderColor(toast.type)}`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${T.tanFaded}`,
            width: "90%", maxWidth: "340px",
            opacity: toast.exiting ? 0 : 1,
            transform: toast.exiting ? "translateX(30px) scale(0.95)" : "translateX(0) scale(1)",
            animation: "toastIn 400ms cubic-bezier(0.34,1.56,0.64,1)",
            transition: "all 400ms ease",
          }}>
            <span style={{
              width: "24px", height: "24px", borderRadius: "6px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `${borderColor(toast.type)}22`, fontSize: "12px",
            }}>
              {toast.icon}
            </span>
            <span style={{ fontSize: "12px", color: T.tan, flex: 1 }}>{toast.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 6. LEASE CARD WITH HOVER ─── */
function LeaseCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.bgCard, borderRadius: "12px", padding: "20px",
        border: `1px solid ${hovered ? T.terra : T.tanFaded}`,
        cursor: "pointer", width: "100%", position: "relative", overflow: "hidden",
        transition: "all 400ms cubic-bezier(0.34,1.56,0.64,1)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${T.terraGlow}`
          : `0 4px 12px rgba(0,0,0,0.15)`,
      }}
    >
      <div style={{
        position: "absolute", top: "-40px", right: "-40px",
        width: "120px", height: "120px", borderRadius: "50%",
        background: `radial-gradient(circle, ${T.terraGlow} 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 500ms ease",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "2px", color: T.textDim, textTransform: "uppercase", marginBottom: "4px" }}>
            Active Lease
          </div>
          <div style={{ fontSize: "15px", color: T.tan, fontWeight: 500 }}>
            8110 E 34th Ct S — Unit A
          </div>
          <div style={{ fontSize: "12px", color: T.textMid, marginTop: "4px" }}>
            Jan 1, 2026 → Dec 31, 2026
          </div>
        </div>
        <div style={{
          padding: "4px 10px", borderRadius: "20px", fontSize: "10px",
          letterSpacing: "1px", textTransform: "uppercase",
          background: T.oliveFaded, color: T.olive, fontWeight: 500,
          border: `1px solid ${T.oliveGlow}`,
        }}>
          Active
        </div>
      </div>

      <div style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "10px", color: T.textDim }}>Lease Progress</span>
          <span style={{ fontSize: "10px", color: T.textMid, fontFamily: mono }}>25%</span>
        </div>
        <div style={{
          width: "100%", height: "4px", background: T.tanFaded, borderRadius: "4px", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", width: hovered ? "25%" : "22%",
            background: `linear-gradient(90deg, ${T.olive}, ${T.terra})`,
            borderRadius: "4px",
            transition: "width 600ms cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: hovered ? `0 0 8px ${T.oliveGlow}` : "none",
          }} />
        </div>
      </div>

      <div style={{
        display: "flex", gap: "12px", marginTop: "14px",
        maxHeight: hovered ? "40px" : "0",
        opacity: hovered ? 1 : 0,
        transition: "all 400ms cubic-bezier(0.34,1.56,0.64,1)",
        overflow: "hidden",
      }}>
        {["View Lease", "E-Sign", "Download PDF"].map((action, i) => (
          <span key={action} style={{
            fontSize: "10px", letterSpacing: "0.5px", color: T.terra,
            padding: "6px 10px", borderRadius: "6px", background: T.terraFaded,
            border: `1px solid ${T.terraGlow}`,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            transition: `all 300ms ease ${i * 80}ms`,
          }}>
            {action}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── 7. ANIMATED PROPERTY TOGGLE ─── */
function PropertyToggle() {
  const [selected, setSelected] = useState(0);
  const properties = [
    { addr: "3417 E Aster St", unit: "Derby Duplex A", rent: "$1,450" },
    { addr: "3421 E Aster St", unit: "Derby Duplex B", rent: "$1,450" },
    { addr: "8110 E 34th Ct S", unit: "New Duplex A", rent: "$1,500" },
  ];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ fontSize: "10px", letterSpacing: "2px", color: T.textDim, textTransform: "uppercase" }}>
        Properties
      </div>
      {properties.map((p, i) => (
        <div key={i} onClick={() => setSelected(i)} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderRadius: "10px", cursor: "pointer",
          background: selected === i ? T.bgHover : T.bgCard,
          border: `1px solid ${selected === i ? T.tanGhost : T.tanFaded}`,
          transition: "all 300ms ease",
          transform: selected === i ? "scale(1.01)" : "scale(1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "18px", height: "18px", borderRadius: "50%",
              border: `2px solid ${selected === i ? T.terra : T.tanGhost}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "border-color 300ms ease",
            }}>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: T.terra,
                transform: selected === i ? "scale(1)" : "scale(0)",
                transition: "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
              }} />
            </div>
            <div>
              <div style={{ fontSize: "13px", color: T.tan }}>{p.addr}</div>
              <div style={{ fontSize: "10px", color: T.textDim }}>{p.unit}</div>
            </div>
          </div>
          <div style={{
            fontSize: "14px", color: selected === i ? T.terra : T.textMid,
            fontFamily: mono, fontWeight: 500,
            transition: "color 300ms ease",
          }}>
            {p.rent}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN SHOWCASE ─── */
export default function UIShowcase() {
  const sections = [
    { title: "Payment Confirmation", desc: "Tap to simulate a rent payment with receipt reveal", component: <PaymentSuccess /> },
    { title: "Dashboard Stats", desc: "Numbers count up as they scroll into view", component: <StatsRow /> },
    { title: "Navigation Tabs", desc: "Sliding indicator follows active tab", component: <NavTabs /> },
    { title: "Lease Card", desc: "Hover to reveal actions and progress detail", component: <LeaseCard /> },
    { title: "Maintenance Tracker", desc: "Animated step-by-step progress on work orders", component: <MaintenanceTracker /> },
    { title: "Property Selector", desc: "Smooth radio transitions between units", component: <PropertyToggle /> },
    { title: "Notification Toasts", desc: "Tap to trigger stacking toast notifications", component: <ToastDemo /> },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, fontFamily: font,
      padding: "32px 16px", display: "flex", flexDirection: "column",
      alignItems: "center", gap: "12px",
    }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{
          fontSize: "10px", letterSpacing: "4px", color: T.textDim,
          textTransform: "uppercase", marginBottom: "8px",
        }}>
          In Time Realty
        </div>
        <div style={{
          fontSize: "22px", fontWeight: 300, color: T.tan,
          letterSpacing: "1px",
        }}>
          UI Component Kit
        </div>
        <div style={{ fontSize: "12px", color: T.textMid, marginTop: "6px" }}>
          Micro-interactions & animated elements
        </div>
      </div>

      <div style={{
        display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px",
        fontSize: "9px", letterSpacing: "1px", color: T.textDim, textTransform: "uppercase",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "20px", height: "6px", borderRadius: "2px", background: T.bgHover, border: `1px solid ${T.tanFaded}` }} />60% Espresso
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "14px", height: "6px", borderRadius: "2px", background: T.tan }} />30% Tan
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "8px", height: "6px", borderRadius: "2px", background: T.terra }} />10% Terracotta
        </div>
      </div>

      {sections.map((section, i) => (
        <div key={i} style={{
          width: "100%", maxWidth: "420px",
          background: T.bg, borderRadius: "16px",
          border: `1px solid ${T.tanFaded}`,
          padding: "24px 20px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "18px",
          boxShadow: `0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 ${T.tanFaded}`,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", color: T.tan, fontWeight: 500, letterSpacing: "0.5px" }}>
              {section.title}
            </div>
            <div style={{ fontSize: "11px", color: T.textDim, marginTop: "3px" }}>
              {section.desc}
            </div>
          </div>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {section.component}
          </div>
        </div>
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes toastIn {
          0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        * { box-sizing: border-box; margin: 0; }
      `}</style>
    </div>
  );
}
