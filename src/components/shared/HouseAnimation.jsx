/**
 * Shared house build animation — used on landing page hero and loading screen.
 * Variant rotates sequentially on every page load (blueprint → brick → silhouette → repeat).
 * Colors come from the daily theme (T from src/lib/theme.js).
 */
import { useState, useEffect, useRef } from "react"
import T from "../../lib/theme"

export const PHASE_DURATION = 480
export const TOTAL_PHASES = 8

const VARIANTS = ["blueprint", "brick", "silhouette"]

export function getSessionVariant() {
  const key = "houseVariantIndex"
  const current = parseInt(sessionStorage.getItem(key) ?? "-1", 10)
  const next = (current + 1) % VARIANTS.length
  sessionStorage.setItem(key, String(next))
  return VARIANTS[next]
}

/* ─── VARIANT A: Blueprint-to-Solid ─── */
export function BlueprintHouse({ phase, t = T }) {
  const draw = (p) => ({
    strokeDasharray: 300,
    strokeDashoffset: phase >= p ? 0 : 300,
    transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out`,
  })
  const appear = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "translateY(0)" : "translateY(6px)",
    transition: `all ${PHASE_DURATION * 0.75}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
  })
  const pop = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "scale(1)" : "scale(0)",
    transition: `all ${PHASE_DURATION * 0.6}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
    transformOrigin: "center center",
  })

  return (
    <svg viewBox="0 0 260 230" width="270" height="240" style={{ overflow: "visible" }}>
      {[0,1,2,3,4,5,6,7].map(i => (
        <line key={`h${i}`} x1="20" y1={40 + i*22} x2="240" y2={40 + i*22}
          stroke={t.mid30Faded || t.tanFaded} strokeWidth="0.5" />
      ))}
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <line key={`v${i}`} x1={20 + i*24} y1="40" x2={20 + i*24} y2="216"
          stroke={t.mid30Faded || t.tanFaded} strokeWidth="0.5" />
      ))}

      <line x1="35" y1="195" x2="225" y2="195"
        stroke={t.mid30Ghost || t.tanGhost} strokeWidth="1" style={draw(0)} />

      <rect x="60" y="185" width="140" height="10" rx="1"
        fill={phase >= 1 ? (t.mid30Faded || t.tanFaded) : "none"}
        stroke={t.mid30 || t.tan}
        strokeWidth={phase >= 2 ? 2 : 1.5}
        strokeDasharray={phase >= 2 ? "none" : "4,3"}
        style={{ ...appear(1), transition: `all ${PHASE_DURATION}ms ease` }} />

      <line x1="65" y1="185" x2="65" y2="115"
        stroke={t.mid30 || t.tan} strokeWidth={phase >= 3 ? 2 : 1}
        strokeDasharray={phase >= 3 ? "none" : "4,3"} style={draw(2)} />
      <line x1="195" y1="185" x2="195" y2="115"
        stroke={t.mid30 || t.tan} strokeWidth={phase >= 3 ? 2 : 1}
        strokeDasharray={phase >= 3 ? "none" : "4,3"} style={draw(2)} />

      <line x1="60" y1="115" x2="200" y2="115"
        stroke={t.mid30 || t.tan} strokeWidth={phase >= 3 ? 2 : 1}
        strokeDasharray={phase >= 3 ? "none" : "4,3"} style={draw(3)} />

      <rect x="65" y="115" width="130" height="70"
        fill={phase >= 3 ? (t.mid30Faded || t.tanFaded) : "transparent"}
        style={{ transition: `fill ${PHASE_DURATION}ms ease` }} />

      <line x1="50" y1="117" x2="130" y2="58"
        stroke={t.accent10 || t.terra} strokeWidth={phase >= 5 ? 2.5 : 1.5}
        strokeDasharray={phase >= 5 ? "none" : "5,4"} style={draw(4)} />
      <line x1="210" y1="117" x2="130" y2="58"
        stroke={t.accent10 || t.terra} strokeWidth={phase >= 5 ? 2.5 : 1.5}
        strokeDasharray={phase >= 5 ? "none" : "5,4"} style={draw(4)} />

      <polygon points="130,58 50,117 210,117"
        fill={phase >= 5 ? (t.accent10Glow || t.terraGlow) : "transparent"}
        style={{ transition: `fill ${PHASE_DURATION}ms ease` }} />

      <rect x="160" y="62" width="12" height="28" rx="1"
        fill="none" stroke={t.accent10 || t.terra} strokeWidth="1.5" style={appear(5)} />
      <line x1="157" y1="62" x2="175" y2="62"
        stroke={t.accent10 || t.terra} strokeWidth="2" style={appear(5)} />

      {phase >= TOTAL_PHASES && (
        <>
          <circle cx="166" cy="52" r="2.5" fill={t.accent10Glow || t.terraGlow}
            style={{ animation: "smokeA 2.5s ease-out infinite" }} />
          <circle cx="169" cy="42" r="3.5" fill={t.mid30Faded || t.tanFaded}
            style={{ animation: "smokeB 3s ease-out infinite 0.6s" }} />
        </>
      )}

      <g style={pop(6, 0)}>
        <rect x="78" y="135" width="24" height="28" rx="2"
          fill={t.mid30Faded || t.tanFaded} stroke={t.mid30 || t.tan} strokeWidth="1.5" />
        <line x1="90" y1="135" x2="90" y2="163" stroke={t.mid30 || t.tan} strokeWidth="1" />
        <line x1="78" y1="149" x2="102" y2="149" stroke={t.mid30 || t.tan} strokeWidth="1" />
        {phase >= TOTAL_PHASES && (
          <rect x="79" y="136" width="22" height="26" rx="1.5"
            fill={t.accent10Glow || t.terraGlow}
            style={{ animation: "winGlow 2.2s ease-in-out infinite alternate" }} />
        )}
      </g>
      <g style={pop(6, 140)}>
        <rect x="158" y="135" width="24" height="28" rx="2"
          fill={t.mid30Faded || t.tanFaded} stroke={t.mid30 || t.tan} strokeWidth="1.5" />
        <line x1="170" y1="135" x2="170" y2="163" stroke={t.mid30 || t.tan} strokeWidth="1" />
        <line x1="158" y1="149" x2="182" y2="149" stroke={t.mid30 || t.tan} strokeWidth="1" />
        {phase >= TOTAL_PHASES && (
          <rect x="159" y="136" width="22" height="26" rx="1.5"
            fill={t.accent10Glow || t.terraGlow}
            style={{ animation: "winGlow 2.2s ease-in-out infinite alternate 0.5s" }} />
        )}
      </g>

      <g style={pop(6, 250)}>
        <rect x="115" y="150" width="30" height="35" rx="3"
          fill={t.accent10Glow || t.terraGlow} stroke={t.accent10 || t.terra} strokeWidth="1.5" />
        <circle cx="139" cy="170" r="2" fill={t.accent10 || t.terra} style={pop(7, 80)} />
      </g>

      <rect x="111" y="185" width="38" height="4" rx="1"
        fill={t.mid30Ghost || t.tanGhost} style={appear(7)} />

      <ellipse cx="46" cy="191" rx="12" ry="7"
        fill={t.mid30Faded || t.tanFaded} stroke={t.mid30Ghost || t.tanGhost} strokeWidth="1" style={pop(7, 250)} />
      <ellipse cx="218" cy="191" rx="14" ry="8"
        fill={t.mid30Faded || t.tanFaded} stroke={t.mid30Ghost || t.tanGhost} strokeWidth="1" style={pop(7, 350)} />

      <g style={{ opacity: phase >= 2 && phase < 6 ? 0.3 : 0, transition: "opacity 400ms ease" }}>
        <line x1="65" y1="200" x2="195" y2="200" stroke={t.mid30 || t.tan} strokeWidth="0.5" />
        <line x1="65" y1="197" x2="65" y2="203" stroke={t.mid30 || t.tan} strokeWidth="0.5" />
        <line x1="195" y1="197" x2="195" y2="203" stroke={t.mid30 || t.tan} strokeWidth="0.5" />
        <text x="130" y="210" textAnchor="middle" fontSize="7" fill={t.textMuted || t.dim}
          fontFamily="'DM Mono', monospace">130'</text>
      </g>
    </svg>
  )
}

/* ─── VARIANT B: Brick-by-Brick Stack ─── */
export function BrickHouse({ phase, t = T }) {
  const appear = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "translateY(0) scaleY(1)" : "translateY(4px) scaleY(0.8)",
    transition: `all ${PHASE_DURATION * 0.5}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
    transformOrigin: "center bottom",
  })
  const pop = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "scale(1)" : "scale(0)",
    transition: `all ${PHASE_DURATION * 0.5}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
    transformOrigin: "center center",
  })

  const brickW = 18, brickH = 9, gap = 2
  const brickRows = [
    { y: 170, count: 7, phase: 2, offset: 0 },
    { y: 159, count: 7, phase: 2, offset: 9 },
    { y: 148, count: 7, phase: 3, offset: 0 },
    { y: 137, count: 7, phase: 3, offset: 9 },
    { y: 126, count: 7, phase: 3, offset: 0 },
    { y: 115, count: 7, phase: 4, offset: 9 },
    { y: 104, count: 7, phase: 4, offset: 0 },
  ]

  return (
    <svg viewBox="0 0 260 230" width="270" height="240" style={{ overflow: "visible" }}>
      <line x1="35" y1="192" x2="225" y2="192"
        stroke={t.mid30Ghost || t.tanGhost} strokeWidth="1.5"
        strokeDasharray={300} strokeDashoffset={phase >= 0 ? 0 : 300}
        style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease` }} />

      <rect x="55" y="180" width="150" height="12" rx="2"
        fill={t.mid30Faded || t.tanFaded} stroke={t.mid30 || t.tan} strokeWidth="1.5" style={appear(1)} />
      <line x1="75" y1="182" x2="75" y2="190" stroke={t.mid30Ghost || t.tanGhost} strokeWidth="0.8" style={appear(1)} />
      <line x1="130" y1="182" x2="130" y2="190" stroke={t.mid30Ghost || t.tanGhost} strokeWidth="0.8" style={appear(1)} />
      <line x1="185" y1="182" x2="185" y2="190" stroke={t.mid30Ghost || t.tanGhost} strokeWidth="0.8" style={appear(1)} />

      {brickRows.map((row, ri) =>
        Array.from({ length: row.count }).map((_, ci) => {
          const x = 58 + row.offset + ci * (brickW + gap)
          if (x + brickW > 200) return null
          return (
            <rect key={`b${ri}-${ci}`}
              x={x} y={row.y} width={brickW} height={brickH} rx="1"
              fill={t.mid30Faded || t.tanFaded} stroke={t.mid30 || t.tan} strokeWidth="1"
              style={appear(row.phase, ci * 40 + ri * 20)} />
          )
        })
      )}

      <line x1="48" y1="106" x2="130" y2="52"
        stroke={t.accent10 || t.terra} strokeWidth="2.5"
        strokeDasharray={200} strokeDashoffset={phase >= 5 ? 0 : 200}
        style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease` }} />
      <line x1="212" y1="106" x2="130" y2="52"
        stroke={t.accent10 || t.terra} strokeWidth="2.5"
        strokeDasharray={200} strokeDashoffset={phase >= 5 ? 0 : 200}
        style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease` }} />
      <line x1="48" y1="106" x2="212" y2="106"
        stroke={t.accent10 || t.terra} strokeWidth="2"
        strokeDasharray={200} strokeDashoffset={phase >= 5 ? 0 : 200}
        style={{ transition: `stroke-dashoffset ${PHASE_DURATION}ms ease` }} />

      {phase >= 5 && [0,1,2].map(row => {
        const rowY = 95 - row * 16
        const halfW = 60 - row * 16
        const count = Math.max(2, 6 - row * 2)
        return Array.from({ length: count }).map((_, ci) => {
          const x = 130 - halfW + ci * (halfW * 2 / count)
          return (
            <rect key={`rt${row}-${ci}`}
              x={x} y={rowY} width={halfW * 2 / count - 2} height={13} rx="1"
              fill={t.accent10Glow || t.terraGlow} stroke={t.accent10 || t.terra} strokeWidth="0.5"
              style={appear(5, 80 + ci * 50 + row * 100)} />
          )
        })
      })}

      <g style={appear(5, 300)}>
        <rect x="158" y="55" width="14" height="30" rx="1"
          fill={t.mid30Faded || t.tanFaded} stroke={t.accent10 || t.terra} strokeWidth="1.5" />
        <line x1="155" y1="55" x2="175" y2="55" stroke={t.accent10 || t.terra} strokeWidth="2" />
      </g>

      {phase >= TOTAL_PHASES && (
        <>
          <circle cx="165" cy="45" r="3" fill={t.accent10Glow || t.terraGlow}
            style={{ animation: "smokeA 2.5s ease-out infinite" }} />
          <circle cx="168" cy="35" r="4" fill={t.mid30Faded || t.tanFaded}
            style={{ animation: "smokeB 3s ease-out infinite 0.5s" }} />
        </>
      )}

      <g style={pop(6, 0)}>
        <rect x="113" y="144" width="28" height="36" rx="3"
          fill={t.accent10Glow || t.terraGlow} stroke={t.accent10 || t.terra} strokeWidth="1.5" />
        <circle cx="135" cy="165" r="2" fill={t.accent10 || t.terra} style={pop(7, 60)} />
      </g>

      <g style={pop(6, 100)}>
        <rect x="70" y="125" width="24" height="22" rx="2"
          fill={t.mid30Faded || t.tanFaded} stroke={t.mid30 || t.tan} strokeWidth="1.5" />
        <line x1="82" y1="125" x2="82" y2="147" stroke={t.mid30 || t.tan} strokeWidth="0.8" />
        <line x1="70" y1="136" x2="94" y2="136" stroke={t.mid30 || t.tan} strokeWidth="0.8" />
        {phase >= TOTAL_PHASES && (
          <rect x="71" y="126" width="22" height="20" rx="1.5" fill={t.accent10Glow || t.terraGlow}
            style={{ animation: "winGlow 2s ease-in-out infinite alternate" }} />
        )}
      </g>
      <g style={pop(6, 200)}>
        <rect x="164" y="125" width="24" height="22" rx="2"
          fill={t.mid30Faded || t.tanFaded} stroke={t.mid30 || t.tan} strokeWidth="1.5" />
        <line x1="176" y1="125" x2="176" y2="147" stroke={t.mid30 || t.tan} strokeWidth="0.8" />
        <line x1="164" y1="136" x2="188" y2="136" stroke={t.mid30 || t.tan} strokeWidth="0.8" />
        {phase >= TOTAL_PHASES && (
          <rect x="165" y="126" width="22" height="20" rx="1.5" fill={t.accent10Glow || t.terraGlow}
            style={{ animation: "winGlow 2s ease-in-out infinite alternate 0.5s" }} />
        )}
      </g>

      <ellipse cx="40" cy="188" rx="13" ry="7"
        fill={t.mid30Faded || t.tanFaded} stroke={t.mid30Ghost || t.tanGhost} strokeWidth="1" style={pop(7, 200)} />
      <ellipse cx="222" cy="188" rx="11" ry="6"
        fill={t.mid30Faded || t.tanFaded} stroke={t.mid30Ghost || t.tanGhost} strokeWidth="1" style={pop(7, 300)} />
      <rect x="108" y="180" width="38" height="5" rx="1"
        fill={t.mid30Ghost || t.tanGhost} style={appear(7, 100)} />
    </svg>
  )
}

/* ─── VARIANT C: Rising Silhouette ─── */
export function SilhouetteHouse({ phase, t = T }) {
  const isDark = t.isDark !== false
  const rise = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "translateY(0)" : "translateY(20px)",
    transition: `all ${PHASE_DURATION * 1.1}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
  })
  const fade = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transition: `opacity ${PHASE_DURATION}ms ease ${delay}ms`,
  })
  const pop = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? "scale(1)" : "scale(0)",
    transition: `all ${PHASE_DURATION * 0.6}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
    transformOrigin: "center center",
  })

  const cutoutFill = t.bg || t.bg60 || "#1A1612"

  return (
    <svg viewBox="0 0 260 230" width="270" height="240" style={{ overflow: "visible" }}>
      <rect x="20" y="192" width="220" height="30"
        fill={t.mid30Faded || t.tanFaded} style={fade(0)} />
      <line x1="20" y1="192" x2="240" y2="192"
        stroke={t.mid30 || t.tan} strokeWidth="1" style={fade(0)} />

      <g style={rise(1)}>
        <rect x="60" y="108" width="140" height="84"
          fill={t.mid30 || t.tan} style={rise(2)} />
        <polygon points="130,45 45,110 215,110"
          fill={t.mid30 || t.tan} style={rise(4)} />
      </g>

      <polygon points="130,55 60,108 200,108"
        fill={t.accent10 || t.terra} style={rise(5)} opacity="0.35" />

      <rect x="165" y="50" width="16" height="35" rx="1"
        fill={t.mid30 || t.tan} style={rise(5)} />
      <rect x="162" y="48" width="22" height="5" rx="1"
        fill={t.accent10 || t.terra} style={rise(5)} opacity="0.6" />

      {phase >= TOTAL_PHASES && (
        <>
          <circle cx="173" cy="38" r="3"
            fill={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}
            style={{ animation: "smokeA 2.5s ease-out infinite" }} />
          <circle cx="176" cy="28" r="4"
            fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
            style={{ animation: "smokeB 3s ease-out infinite 0.5s" }} />
        </>
      )}

      <g style={pop(6, 0)}>
        <rect x="78" y="128" width="28" height="28" rx="3" fill={cutoutFill} />
        <line x1="92" y1="128" x2="92" y2="156" stroke={t.mid30 || t.tan} strokeWidth="1.5" />
        <line x1="78" y1="142" x2="106" y2="142" stroke={t.mid30 || t.tan} strokeWidth="1.5" />
        {phase >= TOTAL_PHASES && (
          <rect x="79" y="129" width="26" height="26" rx="2.5"
            fill={t.accent10Glow || t.terraGlow}
            style={{ animation: "winGlow 2.2s ease-in-out infinite alternate" }} />
        )}
      </g>
      <g style={pop(6, 150)}>
        <rect x="154" y="128" width="28" height="28" rx="3" fill={cutoutFill} />
        <line x1="168" y1="128" x2="168" y2="156" stroke={t.mid30 || t.tan} strokeWidth="1.5" />
        <line x1="154" y1="142" x2="182" y2="142" stroke={t.mid30 || t.tan} strokeWidth="1.5" />
        {phase >= TOTAL_PHASES && (
          <rect x="155" y="129" width="26" height="26" rx="2.5"
            fill={t.accent10Glow || t.terraGlow}
            style={{ animation: "winGlow 2.2s ease-in-out infinite alternate 0.5s" }} />
        )}
      </g>

      <g style={pop(6, 280)}>
        <rect x="115" y="148" width="30" height="44" rx="4" fill={cutoutFill} />
        <path d="M115,160 Q130,148 145,160" fill="none" stroke={t.mid30 || t.tan} strokeWidth="1" />
        <circle cx="139" cy="172" r="2.5" fill={t.accent10 || t.terra} style={pop(7, 80)} />
      </g>

      <rect x="110" y="189" width="40" height="3" rx="1"
        fill={t.accent10 || t.terra} style={fade(7)} opacity="0.5" />

      <g style={pop(7, 200)}>
        <line x1="35" y1="192" x2="35" y2="174" stroke={t.mid30 || t.tan} strokeWidth="2" />
        <circle cx="35" cy="170" r="8" fill={t.mid30 || t.tan} opacity="0.5" />
        <circle cx="35" cy="166" r="6" fill={t.mid30 || t.tan} opacity="0.4" />
      </g>
      <g style={pop(7, 350)}>
        <line x1="230" y1="192" x2="230" y2="178" stroke={t.mid30 || t.tan} strokeWidth="2" />
        <circle cx="230" cy="174" r="7" fill={t.mid30 || t.tan} opacity="0.5" />
        <circle cx="230" cy="171" r="5" fill={t.mid30 || t.tan} opacity="0.4" />
      </g>
    </svg>
  )
}

/**
 * Self-animating house — picks a random variant from sessionStorage,
 * runs through phases automatically, calls onComplete when done.
 * Pass `loop={true}` to keep animating after completion.
 */
export default function HouseAnimation({ loop = false, onComplete, style = {} }) {
  const [variant] = useState(() => getSessionVariant())
  const [phase, setPhase] = useState(0)
  const [done, setDone] = useState(false)
  const intervalRef = useRef(null)

  function start() {
    clearInterval(intervalRef.current)
    setPhase(0)
    setDone(false)
    setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setPhase(p => {
          if (p >= TOTAL_PHASES) {
            clearInterval(intervalRef.current)
            setTimeout(() => {
              setDone(true)
              onComplete?.()
            }, 300)
            return p
          }
          return p + 1
        })
      }, PHASE_DURATION)
    }, 200)
  }

  useEffect(() => {
    start()
    return () => clearInterval(intervalRef.current)
  }, [])

  const props = { phase, t: T }

  return (
    <div style={style}>
      {variant === "blueprint" && <BlueprintHouse {...props} />}
      {variant === "brick" && <BrickHouse {...props} />}
      {variant === "silhouette" && <SilhouetteHouse {...props} />}
    </div>
  )
}

export const houseAnimationKeyframes = `
  @keyframes smokeA {
    0%   { transform: translateY(0)    translateX(0);   opacity: 0.15; }
    100% { transform: translateY(-22px) translateX(5px);  opacity: 0; }
  }
  @keyframes smokeB {
    0%   { transform: translateY(0)    translateX(0);   opacity: 0.1; }
    100% { transform: translateY(-28px) translateX(-4px); opacity: 0; }
  }
  @keyframes winGlow {
    0%   { opacity: 0.3; }
    100% { opacity: 0.8; }
  }
`
