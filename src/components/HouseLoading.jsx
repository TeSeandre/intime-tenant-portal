import { useState, useEffect, useRef } from "react";

/*
  60-30-10 COLOR SCHEMES
  ──────────────────────
  Variant A "Warm Earth"  → 60% deep espresso  | 30% tan        | 10% terracotta
  Variant B "Deep Forest" → 60% dark forest    | 30% olive      | 10% warm cream
  Variant C "Desert Clay" → 60% warm linen     | 30% terracotta | 10% olive
*/

const THEMES = {
  warmEarth: {
    name: "Warm Earth",
    bg60: "#1A1612",
    bg60Lighter: "#241F1A",
    mid30: "#C4A882",
    mid30Faded: "rgba(196,168,130,0.12)",
    mid30Ghost: "rgba(196,168,130,0.25)",
    accent10: "#C2703E",
    accent10Glow: "rgba(194,112,62,0.25)",
    textMuted: "rgba(196,168,130,0.4)",
    textSoft: "rgba(196,168,130,0.6)",
  },
  deepForest: {
    name: "Deep Forest",
    bg60: "#0E1710",
    bg60Lighter: "#162019",
    mid30: "#6B8455",
    mid30Faded: "rgba(107,132,85,0.12)",
    mid30Ghost: "rgba(107,132,85,0.25)",
    accent10: "#D4B896",
    accent10Glow: "rgba(212,184,150,0.25)",
    textMuted: "rgba(107,132,85,0.45)",
    textSoft: "rgba(107,132,85,0.65)",
  },
  desertClay: {
    name: "Desert Clay",
    bg60: "#F5EDE3",
    bg60Lighter: "#EDE3D6",
    mid30: "#B85A3A",
    mid30Faded: "rgba(184,90,58,0.08)",
    mid30Ghost: "rgba(184,90,58,0.2)",
    accent10: "#556B44",
    accent10Glow: "rgba(85,107,68,0.2)",
    textMuted: "rgba(184,90,58,0.35)",
    textSoft: "rgba(184,90,58,0.55)",
    isDark: false,
  },
};

const PHASE_DURATION = 550;
const TOTAL_PHASES = 8;

/* ─── VARIANT A: Blueprint-to-Solid ─── */
function BlueprintHouse({ phase, t }) {
  const draw = (p) => ({
    strokeDasharray: 300,
    strokeDashoffset: phase >= p ? 0 : 300,
    transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out`,
  });
  const appear = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "translateY(0)" : "translateY(6px)",
    transition: `all ${PHASE_DURATION * 0.75}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
  });
  const pop = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "scale(1)" : "scale(0)",
    transition: `all ${PHASE_DURATION * 0.6}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
    transformOrigin: "center center",
  });

  return (
    <svg viewBox="0 0 260 230" width="270" height="240" style={{ overflow: "visible" }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={`h${i}`} x1="20" y1={40 + i * 22} x2="240" y2={40 + i * 22}
          stroke={t.mid30Faded} strokeWidth="0.5" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <line key={`v${i}`} x1={20 + i * 24} y1="40" x2={20 + i * 24} y2="216"
          stroke={t.mid30Faded} strokeWidth="0.5" />
      ))}

      <line x1="35" y1="195" x2="225" y2="195"
        stroke={t.mid30Ghost} strokeWidth="1" style={draw(0)} />

      <rect x="60" y="185" width="140" height="10" rx="1"
        fill={phase >= 1 ? t.mid30Faded : "none"}
        stroke={t.mid30}
        strokeWidth={phase >= 2 ? 2 : 1.5}
        strokeDasharray={phase >= 2 ? "none" : "4,3"}
        style={{ ...appear(1), transition: `all ${PHASE_DURATION}ms ease` }} />

      <line x1="65" y1="185" x2="65" y2="115"
        stroke={t.mid30} strokeWidth={phase >= 3 ? 2 : 1}
        strokeDasharray={phase >= 3 ? "none" : "4,3"} style={draw(2)} />
      <line x1="195" y1="185" x2="195" y2="115"
        stroke={t.mid30} strokeWidth={phase >= 3 ? 2 : 1}
        strokeDasharray={phase >= 3 ? "none" : "4,3"} style={draw(2)} />

      <line x1="60" y1="115" x2="200" y2="115"
        stroke={t.mid30} strokeWidth={phase >= 3 ? 2 : 1}
        strokeDasharray={phase >= 3 ? "none" : "4,3"} style={draw(3)} />

      <rect x="65" y="115" width="130" height="70"
        fill={phase >= 3 ? t.mid30Faded : "transparent"}
        style={{ transition: `fill ${PHASE_DURATION}ms ease` }} />

      <line x1="50" y1="117" x2="130" y2="58"
        stroke={t.accent10} strokeWidth={phase >= 5 ? 2.5 : 1.5}
        strokeDasharray={phase >= 5 ? "none" : "5,4"} style={draw(4)} />
      <line x1="210" y1="117" x2="130" y2="58"
        stroke={t.accent10} strokeWidth={phase >= 5 ? 2.5 : 1.5}
        strokeDasharray={phase >= 5 ? "none" : "5,4"} style={draw(4)} />

      <polygon points="130,58 50,117 210,117"
        fill={phase >= 5 ? t.accent10Glow : "transparent"}
        style={{ transition: `fill ${PHASE_DURATION}ms ease` }} />

      <rect x="160" y="62" width="12" height="28" rx="1"
        fill="none" stroke={t.accent10} strokeWidth="1.5" style={appear(5)} />
      <line x1="157" y1="62" x2="175" y2="62"
        stroke={t.accent10} strokeWidth="2" style={appear(5)} />

      {phase >= TOTAL_PHASES && (
        <>
          <circle cx="166" cy="52" r="2.5" fill={t.accent10Glow}
            style={{ animation: "smokeA 2.5s ease-out infinite" }} />
          <circle cx="169" cy="42" r="3.5" fill={t.mid30Faded}
            style={{ animation: "smokeB 3s ease-out infinite 0.6s" }} />
        </>
      )}

      <g style={pop(6, 0)}>
        <rect x="78" y="135" width="24" height="28" rx="2"
          fill={t.mid30Faded} stroke={t.mid30} strokeWidth="1.5" />
        <line x1="90" y1="135" x2="90" y2="163" stroke={t.mid30} strokeWidth="1" />
        <line x1="78" y1="149" x2="102" y2="149" stroke={t.mid30} strokeWidth="1" />
        {phase >= TOTAL_PHASES && (
          <rect x="79" y="136" width="22" height="26" rx="1.5"
            fill={t.accent10Glow}
            style={{ animation: "winGlow 2.2s ease-in-out infinite alternate" }} />
        )}
      </g>
      <g style={pop(6, 140)}>
        <rect x="158" y="135" width="24" height="28" rx="2"
          fill={t.mid30Faded} stroke={t.mid30} strokeWidth="1.5" />
        <line x1="170" y1="135" x2="170" y2="163" stroke={t.mid30} strokeWidth="1" />
        <line x1="158" y1="149" x2="182" y2="149" stroke={t.mid30} strokeWidth="1" />
        {phase >= TOTAL_PHASES && (
          <rect x="159" y="136" width="22" height="26" rx="1.5"
            fill={t.accent10Glow}
            style={{ animation: "winGlow 2.2s ease-in-out infinite alternate 0.5s" }} />
        )}
      </g>

      <g style={pop(6, 250)}>
        <rect x="115" y="150" width="30" height="35" rx="3"
          fill={t.accent10Glow} stroke={t.accent10} strokeWidth="1.5" />
        <circle cx="139" cy="170" r="2" fill={t.accent10} style={pop(7, 80)} />
      </g>

      <rect x="111" y="185" width="38" height="4" rx="1"
        fill={t.mid30Ghost} style={appear(7)} />

      <ellipse cx="46" cy="191" rx="12" ry="7"
        fill={t.mid30Faded} stroke={t.mid30Ghost} strokeWidth="1" style={pop(7, 250)} />
      <ellipse cx="218" cy="191" rx="14" ry="8"
        fill={t.mid30Faded} stroke={t.mid30Ghost} strokeWidth="1" style={pop(7, 350)} />

      <g style={{ opacity: phase >= 2 && phase < 6 ? 0.3 : 0, transition: "opacity 400ms ease" }}>
        <line x1="65" y1="200" x2="195" y2="200" stroke={t.mid30} strokeWidth="0.5" />
        <line x1="65" y1="197" x2="65" y2="203" stroke={t.mid30} strokeWidth="0.5" />
        <line x1="195" y1="197" x2="195" y2="203" stroke={t.mid30} strokeWidth="0.5" />
        <text x="130" y="210" textAnchor="middle" fontSize="7" fill={t.textMuted}
          fontFamily="'DM Mono', monospace">130'</text>
      </g>
    </svg>
  );
}

/* ─── VARIANT B: Brick-by-Brick Stack ─── */
function BrickHouse({ phase, t }) {
  const appear = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "translateY(0) scaleY(1)" : "translateY(4px) scaleY(0.8)",
    transition: `all ${PHASE_DURATION * 0.5}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
    transformOrigin: "center bottom",
  });
  const pop = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "scale(1)" : "scale(0)",
    transition: `all ${PHASE_DURATION * 0.5}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
    transformOrigin: "center center",
  });

  const brickW = 18;
  const brickH = 9;
  const gap = 2;

  const brickRows = [
    { y: 170, count: 7, phase: 2, offset: 0 },
    { y: 159, count: 7, phase: 2, offset: 9 },
    { y: 148, count: 7, phase: 3, offset: 0 },
    { y: 137, count: 7, phase: 3, offset: 9 },
    { y: 126, count: 7, phase: 3, offset: 0 },
    { y: 115, count: 7, phase: 4, offset: 9 },
    { y: 104, count: 7, phase: 4, offset: 0 },
  ];

  return (
    <svg viewBox="0 0 260 230" width="270" height="240" style={{ overflow: "visible" }}>
      <line x1="35" y1="192" x2="225" y2="192"
        stroke={t.mid30Ghost} strokeWidth="1.5"
        strokeDasharray={300} strokeDashoffset={phase >= 0 ? 0 : 300}
        style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease` }} />

      <rect x="55" y="180" width="150" height="12" rx="2"
        fill={t.mid30Faded} stroke={t.mid30} strokeWidth="1.5" style={appear(1)} />
      <line x1="75" y1="182" x2="75" y2="190" stroke={t.mid30Ghost} strokeWidth="0.8" style={appear(1)} />
      <line x1="130" y1="182" x2="130" y2="190" stroke={t.mid30Ghost} strokeWidth="0.8" style={appear(1)} />
      <line x1="185" y1="182" x2="185" y2="190" stroke={t.mid30Ghost} strokeWidth="0.8" style={appear(1)} />

      {brickRows.map((row, ri) =>
        Array.from({ length: row.count }).map((_, ci) => {
          const x = 58 + row.offset + ci * (brickW + gap);
          if (x + brickW > 200) return null;
          const delay = ci * 40 + ri * 20;
          return (
            <rect key={`b${ri}-${ci}`}
              x={x} y={row.y} width={brickW} height={brickH} rx="1"
              fill={t.mid30Faded} stroke={t.mid30} strokeWidth="1"
              style={appear(row.phase, delay)} />
          );
        })
      )}

      <line x1="48" y1="106" x2="130" y2="52"
        stroke={t.accent10} strokeWidth="2.5"
        strokeDasharray={200} strokeDashoffset={phase >= 5 ? 0 : 200}
        style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease` }} />
      <line x1="212" y1="106" x2="130" y2="52"
        stroke={t.accent10} strokeWidth="2.5"
        strokeDasharray={200} strokeDashoffset={phase >= 5 ? 0 : 200}
        style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease` }} />
      <line x1="48" y1="106" x2="212" y2="106"
        stroke={t.accent10} strokeWidth="2"
        strokeDasharray={200} strokeDashoffset={phase >= 5 ? 0 : 200}
        style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease` }} />

      {phase >= 5 && [0, 1, 2].map((row) => {
        const rowY = 95 - row * 16;
        const halfW = 60 - row * 16;
        const count = Math.max(2, 6 - row * 2);
        return Array.from({ length: count }).map((_, ci) => {
          const x = 130 - halfW + ci * (halfW * 2 / count);
          return (
            <rect key={`rt${row}-${ci}`}
              x={x} y={rowY} width={halfW * 2 / count - 2} height={13} rx="1"
              fill={t.accent10Glow} stroke={t.accent10} strokeWidth="0.5"
              style={appear(5, 80 + ci * 50 + row * 100)} />
          );
        });
      })}

      <g style={appear(5, 300)}>
        <rect x="158" y="55" width="14" height="30" rx="1"
          fill={t.mid30Faded} stroke={t.accent10} strokeWidth="1.5" />
        <line x1="155" y1="55" x2="175" y2="55" stroke={t.accent10} strokeWidth="2" />
      </g>

      {phase >= TOTAL_PHASES && (
        <>
          <circle cx="165" cy="45" r="3" fill={t.accent10Glow}
            style={{ animation: "smokeA 2.5s ease-out infinite" }} />
          <circle cx="168" cy="35" r="4" fill={t.mid30Faded}
            style={{ animation: "smokeB 3s ease-out infinite 0.5s" }} />
        </>
      )}

      <g style={pop(6, 0)}>
        <rect x="113" y="144" width="28" height="36" rx="3"
          fill={t.accent10Glow} stroke={t.accent10} strokeWidth="1.5" />
        <circle cx="135" cy="165" r="2" fill={t.accent10} style={pop(7, 60)} />
      </g>

      <g style={pop(6, 100)}>
        <rect x="70" y="125" width="24" height="22" rx="2"
          fill={t.mid30Faded} stroke={t.mid30} strokeWidth="1.5" />
        <line x1="82" y1="125" x2="82" y2="147" stroke={t.mid30} strokeWidth="0.8" />
        <line x1="70" y1="136" x2="94" y2="136" stroke={t.mid30} strokeWidth="0.8" />
        {phase >= TOTAL_PHASES && (
          <rect x="71" y="126" width="22" height="20" rx="1.5" fill={t.accent10Glow}
            style={{ animation: "winGlow 2s ease-in-out infinite alternate" }} />
        )}
      </g>
      <g style={pop(6, 200)}>
        <rect x="164" y="125" width="24" height="22" rx="2"
          fill={t.mid30Faded} stroke={t.mid30} strokeWidth="1.5" />
        <line x1="176" y1="125" x2="176" y2="147" stroke={t.mid30} strokeWidth="0.8" />
        <line x1="164" y1="136" x2="188" y2="136" stroke={t.mid30} strokeWidth="0.8" />
        {phase >= TOTAL_PHASES && (
          <rect x="165" y="126" width="22" height="20" rx="1.5" fill={t.accent10Glow}
            style={{ animation: "winGlow 2s ease-in-out infinite alternate 0.5s" }} />
        )}
      </g>

      <ellipse cx="40" cy="188" rx="13" ry="7"
        fill={t.mid30Faded} stroke={t.mid30Ghost} strokeWidth="1" style={pop(7, 200)} />
      <ellipse cx="222" cy="188" rx="11" ry="6"
        fill={t.mid30Faded} stroke={t.mid30Ghost} strokeWidth="1" style={pop(7, 300)} />
      <rect x="108" y="180" width="38" height="5" rx="1"
        fill={t.mid30Ghost} style={appear(7, 100)} />
    </svg>
  );
}

/* ─── VARIANT C: Rising Silhouette ─── */
function SilhouetteHouse({ phase, t }) {
  const isDark = t.isDark !== false;
  const rise = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "translateY(0)" : "translateY(20px)",
    transition: `all ${PHASE_DURATION * 1.1}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  });
  const fade = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transition: `opacity ${PHASE_DURATION}ms ease ${delay}ms`,
  });
  const pop = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "scale(1)" : "scale(0)",
    transition: `all ${PHASE_DURATION * 0.6}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
    transformOrigin: "center center",
  });

  const cutoutFill = t.bg60;

  return (
    <svg viewBox="0 0 260 230" width="270" height="240" style={{ overflow: "visible" }}>
      <rect x="20" y="192" width="220" height="30" rx="0"
        fill={t.mid30Faded} style={fade(0)} />
      <line x1="20" y1="192" x2="240" y2="192"
        stroke={t.mid30} strokeWidth="1" style={fade(0)} />

      <g style={rise(1)}>
        <rect x="60" y="108" width="140" height="84" rx="0"
          fill={t.mid30} style={rise(2)} />
        <polygon points="130,45 45,110 215,110"
          fill={t.mid30} style={rise(4)} />
      </g>

      <polygon points="130,55 60,108 200,108"
        fill={t.accent10} style={rise(5)}
        opacity="0.35" />

      <rect x="165" y="50" width="16" height="35" rx="1"
        fill={t.mid30} style={rise(5)} />
      <rect x="162" y="48" width="22" height="5" rx="1"
        fill={t.accent10} style={rise(5)} opacity="0.6" />

      {phase >= TOTAL_PHASES && (
        <>
          <circle cx="173" cy="38" r="3" fill={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}
            style={{ animation: "smokeA 2.5s ease-out infinite" }} />
          <circle cx="176" cy="28" r="4" fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
            style={{ animation: "smokeB 3s ease-out infinite 0.5s" }} />
        </>
      )}

      <g style={pop(6, 0)}>
        <rect x="78" y="128" width="28" height="28" rx="3" fill={cutoutFill} />
        <line x1="92" y1="128" x2="92" y2="156" stroke={t.mid30} strokeWidth="1.5" />
        <line x1="78" y1="142" x2="106" y2="142" stroke={t.mid30} strokeWidth="1.5" />
        {phase >= TOTAL_PHASES && (
          <rect x="79" y="129" width="26" height="26" rx="2.5" fill={t.accent10Glow}
            style={{ animation: "winGlow 2.2s ease-in-out infinite alternate" }} />
        )}
      </g>
      <g style={pop(6, 150)}>
        <rect x="154" y="128" width="28" height="28" rx="3" fill={cutoutFill} />
        <line x1="168" y1="128" x2="168" y2="156" stroke={t.mid30} strokeWidth="1.5" />
        <line x1="154" y1="142" x2="182" y2="142" stroke={t.mid30} strokeWidth="1.5" />
        {phase >= TOTAL_PHASES && (
          <rect x="155" y="129" width="26" height="26" rx="2.5" fill={t.accent10Glow}
            style={{ animation: "winGlow 2.2s ease-in-out infinite alternate 0.5s" }} />
        )}
      </g>

      <g style={pop(6, 280)}>
        <rect x="115" y="148" width="30" height="44" rx="4" fill={cutoutFill} />
        <path d="M115,160 Q130,148 145,160" fill="none" stroke={t.mid30} strokeWidth="1" />
        <circle cx="139" cy="172" r="2.5" fill={t.accent10} style={pop(7, 80)} />
      </g>

      <rect x="110" y="189" width="40" height="3" rx="1"
        fill={t.accent10} style={fade(7)} opacity="0.5" />

      <g style={pop(7, 200)}>
        <line x1="35" y1="192" x2="35" y2="174" stroke={t.mid30} strokeWidth="2" />
        <circle cx="35" cy="170" r="8" fill={t.mid30} opacity="0.5" />
        <circle cx="35" cy="166" r="6" fill={t.mid30} opacity="0.4" />
      </g>
      <g style={pop(7, 350)}>
        <line x1="230" y1="192" x2="230" y2="178" stroke={t.mid30} strokeWidth="2" />
        <circle cx="230" cy="174" r="7" fill={t.mid30} opacity="0.5" />
        <circle cx="230" cy="171" r="5" fill={t.mid30} opacity="0.4" />
      </g>
    </svg>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function HouseLoadingShowcase() {
  const [activeTheme, setActiveTheme] = useState("warmEarth");
  const [activeVariant, setActiveVariant] = useState("blueprint");
  const [phase, setPhase] = useState(0);
  const [complete, setComplete] = useState(false);
  const intervalRef = useRef(null);

  const t = THEMES[activeTheme];
  const isDark = t.isDark !== false;

  const restart = () => {
    clearInterval(intervalRef.current);
    setPhase(0);
    setComplete(false);
    setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setPhase((p) => {
          if (p >= TOTAL_PHASES) {
            clearInterval(intervalRef.current);
            setTimeout(() => setComplete(true), 300);
            return p;
          }
          return p + 1;
        });
      }, PHASE_DURATION);
    }, 200);
  };

  useEffect(() => {
    restart();
    return () => clearInterval(intervalRef.current);
  }, [activeTheme, activeVariant]);

  const progress = Math.min((phase / TOTAL_PHASES) * 100, 100);
  const phaseLabels = [
    "Preparing site...", "Laying foundation...", "Framing walls...",
    "Adding structure...", "Installing roof...", "Finishing roof...",
    "Adding windows & door...", "Final touches...", "Welcome home."
  ];

  const variants = [
    { id: "blueprint", label: "Blueprint", desc: "Lines to Solid" },
    { id: "brick", label: "Brick", desc: "Stack by Stack" },
    { id: "silhouette", label: "Silhouette", desc: "Rising Shape" },
  ];
  const themes = [
    { id: "warmEarth", label: "Warm Earth" },
    { id: "deepForest", label: "Deep Forest" },
    { id: "desertClay", label: "Desert Clay" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: t.bg60,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'DM Sans', 'Avenir', sans-serif",
      transition: "background 500ms ease",
      padding: "24px 16px",
    }}>

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "16px", marginBottom: "32px", width: "100%", maxWidth: "400px",
      }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {themes.map((th) => (
            <button key={th.id} onClick={() => setActiveTheme(th.id)} style={{
              padding: "8px 16px", borderRadius: "6px", border: "none",
              fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase",
              cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
              background: activeTheme === th.id ? t.mid30 : t.bg60Lighter,
              color: activeTheme === th.id
                ? (THEMES[th.id].isDark !== false ? THEMES[th.id].bg60 : "#fff")
                : (THEMES[th.id].isDark !== false ? THEMES[th.id].textSoft : THEMES[th.id].textSoft),
              transition: "all 200ms ease",
            }}>
              {th.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {variants.map((v) => (
            <button key={v.id} onClick={() => setActiveVariant(v.id)} style={{
              padding: "6px 14px", borderRadius: "20px",
              border: `1px solid ${activeVariant === v.id ? t.accent10 : t.mid30Ghost}`,
              fontSize: "11px", letterSpacing: "0.5px", cursor: "pointer",
              fontFamily: "inherit",
              background: activeVariant === v.id ? t.accent10Glow : "transparent",
              color: activeVariant === v.id ? t.accent10 : t.textMuted,
              transition: "all 200ms ease",
            }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        width: "100%", maxWidth: "420px",
        background: t.bg60,
        borderRadius: "16px",
        border: `1px solid ${t.mid30Faded}`,
        padding: "40px 24px 32px",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "28px", position: "relative",
        boxShadow: isDark
          ? `0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 ${t.mid30Faded}`
          : `0 20px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`,
      }}>

        <div style={{
          position: "absolute", width: "300px", height: "300px", borderRadius: "50%",
          background: `radial-gradient(circle, ${t.accent10Glow} 0%, transparent 70%)`,
          top: "50%", left: "50%", transform: "translate(-50%, -55%)", pointerEvents: "none",
          opacity: 0.5,
        }} />

        <div style={{
          fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase",
          color: t.textMuted, fontWeight: 500,
        }}>
          In Time Realty
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {activeVariant === "blueprint" && <BlueprintHouse phase={phase} t={t} />}
          {activeVariant === "brick" && <BrickHouse phase={phase} t={t} />}
          {activeVariant === "silhouette" && <SilhouetteHouse phase={phase} t={t} />}
        </div>

        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "14px", width: "80%", position: "relative", zIndex: 1,
        }}>
          <div style={{
            width: "100%", height: "2px", background: t.mid30Faded,
            borderRadius: "2px", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${progress}%`, borderRadius: "2px",
              background: `linear-gradient(90deg, ${t.mid30Ghost}, ${t.accent10})`,
              transition: `width ${PHASE_DURATION}ms ease-out`,
              boxShadow: progress >= 100 ? `0 0 12px ${t.accent10Glow}` : "none",
            }} />
          </div>
          <div style={{
            fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase",
            fontWeight: complete ? 500 : 400, minHeight: "18px",
            color: complete ? t.accent10 : t.textMuted,
            transition: "all 400ms ease",
          }}>
            {phaseLabels[Math.min(phase, TOTAL_PHASES)]}
          </div>
        </div>

        {complete && (
          <button onClick={restart} style={{
            padding: "8px 20px", borderRadius: "20px",
            border: `1px solid ${t.mid30Ghost}`, background: "transparent",
            color: t.textSoft, fontSize: "11px", letterSpacing: "1px",
            cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase",
            transition: "all 200ms ease",
          }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = t.accent10;
              e.target.style.color = t.accent10;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = t.mid30Ghost;
              e.target.style.color = t.textSoft;
            }}
          >
            Replay
          </button>
        )}
      </div>

      <div style={{
        marginTop: "28px", display: "flex", gap: "12px", alignItems: "center",
        fontSize: "10px", letterSpacing: "1px", color: t.textMuted, textTransform: "uppercase",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "24px", height: "8px", borderRadius: "2px", background: t.bg60Lighter, border: `1px solid ${t.mid30Faded}` }} />
          60%
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "16px", height: "8px", borderRadius: "2px", background: t.mid30 }} />
          30%
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: t.accent10 }} />
          10%
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes smokeA {
          0% { transform: translateY(0) translateX(0); opacity: 0.15; }
          100% { transform: translateY(-22px) translateX(5px); opacity: 0; }
        }
        @keyframes smokeB {
          0% { transform: translateY(0) translateX(0); opacity: 0.1; }
          100% { transform: translateY(-28px) translateX(-4px); opacity: 0; }
        }
        @keyframes winGlow {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
