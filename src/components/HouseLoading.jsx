import { useState, useEffect, useRef } from "react"
import T from "../lib/theme"
import {
  BlueprintHouse, BrickHouse, SilhouetteHouse,
  getSessionVariant, PHASE_DURATION, TOTAL_PHASES,
  houseAnimationKeyframes,
} from "./shared/HouseAnimation"

const font = "'DM Sans', 'Avenir', sans-serif"

const phaseLabels = [
  "Preparing site...", "Laying foundation...", "Framing walls...",
  "Adding structure...", "Installing roof...", "Finishing roof...",
  "Adding windows & door...", "Final touches...", "Welcome home.",
]

export default function HouseLoading() {
  const [variant] = useState(() => getSessionVariant())
  const [phase, setPhase] = useState(0)
  const [complete, setComplete] = useState(false)
  const intervalRef = useRef(null)

  function restart() {
    clearInterval(intervalRef.current)
    setPhase(0)
    setComplete(false)
    setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setPhase(p => {
          if (p >= TOTAL_PHASES) {
            clearInterval(intervalRef.current)
            setTimeout(() => setComplete(true), 300)
            return p
          }
          return p + 1
        })
      }, PHASE_DURATION)
    }, 200)
  }

  useEffect(() => {
    restart()
    return () => clearInterval(intervalRef.current)
  }, [])

  const progress = Math.min((phase / TOTAL_PHASES) * 100, 100)
  const isDark = T.isDark !== false

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: font,
      padding: "24px 16px",
    }}>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", width: "500px", height: "500px", borderRadius: "50%",
        background: `radial-gradient(circle, ${T.terraGlow} 0%, transparent 60%)`,
        top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        opacity: 0.2, pointerEvents: "none",
      }} />

      <div style={{
        width: "100%", maxWidth: "420px",
        background: T.bgCard,
        borderRadius: "20px",
        border: `1px solid ${T.tanFaded}`,
        padding: "40px 24px 32px",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "28px", position: "relative",
        boxShadow: isDark
          ? `0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 ${T.tanFaded}`
          : `0 20px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)`,
      }}>

        {/* Brand */}
        <div style={{
          fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase",
          color: T.dim, fontWeight: 500,
        }}>
          In Time Realty
        </div>

        {/* House animation */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {variant === "blueprint" && <BlueprintHouse phase={phase} t={T} />}
          {variant === "brick" && <BrickHouse phase={phase} t={T} />}
          {variant === "silhouette" && <SilhouetteHouse phase={phase} t={T} />}
        </div>

        {/* Progress bar + label */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "14px", width: "80%", position: "relative", zIndex: 1,
        }}>
          <div style={{
            width: "100%", height: "2px", background: T.tanFaded,
            borderRadius: "2px", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${progress}%`, borderRadius: "2px",
              background: `linear-gradient(90deg, ${T.tanGhost}, ${T.terra})`,
              transition: `width ${PHASE_DURATION}ms ease-out`,
              boxShadow: progress >= 100 ? `0 0 12px ${T.terraGlow}` : "none",
            }} />
          </div>
          <div style={{
            fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase",
            fontWeight: complete ? 500 : 400, minHeight: "18px",
            color: complete ? T.terra : T.dim,
            transition: "all 400ms ease",
          }}>
            {phaseLabels[Math.min(phase, TOTAL_PHASES)]}
          </div>
        </div>

        {complete && (
          <button onClick={restart} style={{
            padding: "8px 20px", borderRadius: "20px",
            border: `1px solid ${T.tanGhost}`, background: "transparent",
            color: T.mid, fontSize: "11px", letterSpacing: "1px",
            cursor: "pointer", fontFamily: font, textTransform: "uppercase",
            transition: "all 200ms ease",
          }}
            onMouseEnter={e => { e.target.style.borderColor = T.terra; e.target.style.color = T.terra }}
            onMouseLeave={e => { e.target.style.borderColor = T.tanGhost; e.target.style.color = T.mid }}
          >
            Replay
          </button>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        ${houseAnimationKeyframes}
      `}</style>
    </div>
  )
}
