import { useState, useEffect } from 'react'
import T from '../../lib/theme'
const font = "'DM Sans', 'Avenir', sans-serif"
const mono = "'DM Mono', 'SF Mono', monospace"
const PHASE_DURATION = 320
const TOTAL_PHASES = 8

function HouseSVG({ phase }) {
  const draw = (p) => ({
    strokeDasharray: 300,
    strokeDashoffset: phase >= p ? 0 : 300,
    transition: `stroke-dashoffset ${PHASE_DURATION}ms ease-out`,
  })
  const appear = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? 'translateY(0)' : 'translateY(6px)',
    transition: `all ${PHASE_DURATION * 0.75}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
  })
  const pop = (p, delay = 0) => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? 'scale(1)' : 'scale(0)',
    transition: `all ${PHASE_DURATION * 0.6}ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
    transformOrigin: 'center center',
  })

  return (
    <svg viewBox="0 0 260 230" width="200" height="178" style={{ overflow: 'visible' }}>
      {[0,1,2,3,4,5,6,7].map(i => (
        <line key={`h${i}`} x1="20" y1={40+i*22} x2="240" y2={40+i*22} stroke={T.tanFaded} strokeWidth="0.5" />
      ))}
      {[0,1,2,3,4,5,6,7,8,9].map(i => (
        <line key={`v${i}`} x1={20+i*24} y1="40" x2={20+i*24} y2="216" stroke={T.tanFaded} strokeWidth="0.5" />
      ))}
      <line x1="35" y1="195" x2="225" y2="195" stroke={T.tanGhost} strokeWidth="1" style={draw(0)} />
      <rect x="60" y="185" width="140" height="10" rx="1"
        fill={phase >= 1 ? T.tanFaded : 'none'} stroke={T.tan}
        strokeWidth={phase >= 2 ? 2 : 1.5} strokeDasharray={phase >= 2 ? 'none' : '4,3'}
        style={{ ...appear(1), transition: `all ${PHASE_DURATION}ms ease` }} />
      <line x1="65" y1="185" x2="65" y2="115" stroke={T.tan} strokeWidth={phase >= 3 ? 2 : 1} strokeDasharray={phase >= 3 ? 'none' : '4,3'} style={draw(2)} />
      <line x1="195" y1="185" x2="195" y2="115" stroke={T.tan} strokeWidth={phase >= 3 ? 2 : 1} strokeDasharray={phase >= 3 ? 'none' : '4,3'} style={draw(2)} />
      <line x1="60" y1="115" x2="200" y2="115" stroke={T.tan} strokeWidth={phase >= 3 ? 2 : 1} strokeDasharray={phase >= 3 ? 'none' : '4,3'} style={draw(3)} />
      <rect x="65" y="115" width="130" height="70" fill={phase >= 3 ? T.tanFaded : 'transparent'} style={{ transition: `fill ${PHASE_DURATION}ms ease` }} />
      <line x1="50" y1="117" x2="130" y2="58" stroke={T.terra} strokeWidth={phase >= 5 ? 2.5 : 1.5} strokeDasharray={phase >= 5 ? 'none' : '5,4'} style={draw(4)} />
      <line x1="210" y1="117" x2="130" y2="58" stroke={T.terra} strokeWidth={phase >= 5 ? 2.5 : 1.5} strokeDasharray={phase >= 5 ? 'none' : '5,4'} style={draw(4)} />
      <polygon points="130,58 50,117 210,117" fill={phase >= 5 ? T.terraGlow : 'transparent'} style={{ transition: `fill ${PHASE_DURATION}ms ease` }} />
      <rect x="160" y="62" width="12" height="28" rx="1" fill="none" stroke={T.terra} strokeWidth="1.5" style={appear(5)} />
      <line x1="157" y1="62" x2="175" y2="62" stroke={T.terra} strokeWidth="2" style={appear(5)} />
      <g style={pop(6, 0)}>
        <rect x="78" y="135" width="24" height="28" rx="2" fill={T.tanFaded} stroke={T.tan} strokeWidth="1.5" />
        <line x1="90" y1="135" x2="90" y2="163" stroke={T.tan} strokeWidth="1" />
        <line x1="78" y1="149" x2="102" y2="149" stroke={T.tan} strokeWidth="1" />
      </g>
      <g style={pop(6, 140)}>
        <rect x="158" y="135" width="24" height="28" rx="2" fill={T.tanFaded} stroke={T.tan} strokeWidth="1.5" />
        <line x1="170" y1="135" x2="170" y2="163" stroke={T.tan} strokeWidth="1" />
        <line x1="158" y1="149" x2="182" y2="149" stroke={T.tan} strokeWidth="1" />
      </g>
      <g style={pop(6, 250)}>
        <rect x="115" y="150" width="30" height="35" rx="3" fill={T.terraFaded} stroke={T.terra} strokeWidth="1.5" />
        <circle cx="139" cy="170" r="2" fill={T.terra} style={pop(7, 80)} />
      </g>
      <ellipse cx="46" cy="191" rx="12" ry="7" fill={T.tanFaded} stroke={T.tanGhost} strokeWidth="1" style={pop(7, 250)} />
      <ellipse cx="218" cy="191" rx="14" ry="8" fill={T.tanFaded} stroke={T.tanGhost} strokeWidth="1" style={pop(7, 350)} />
    </svg>
  )
}

const phaseLabels = [
  'Preparing site...', 'Laying foundation...', 'Framing walls...',
  'Adding structure...', 'Installing roof...', 'Finishing roof...',
  'Adding details...', 'Final touches...', 'Almost there...',
]

export default function HouseSpinner({ message }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => p >= TOTAL_PHASES ? 0 : p + 1)
    }, PHASE_DURATION)
    return () => clearInterval(interval)
  }, [])

  const progress = (phase / TOTAL_PHASES) * 100

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '28px', fontFamily: font,
    }}>
      <div style={{ fontSize: '10px', letterSpacing: '4px', color: T.textDim, textTransform: 'uppercase' }}>
        In Time Realty
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', width: '260px', height: '260px', borderRadius: '50%',
          background: `radial-gradient(circle, ${T.terraGlow} 0%, transparent 70%)`,
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        }} />
        <HouseSVG phase={phase} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '200px' }}>
        <div style={{ width: '100%', height: '2px', background: T.tanFaded, borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`, borderRadius: '2px',
            background: `linear-gradient(90deg, ${T.tanGhost}, ${T.terra})`,
            transition: `width ${PHASE_DURATION}ms ease-out`,
          }} />
        </div>
        <div style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: T.textMid, fontFamily: mono }}>
          {message || phaseLabels[phase]}
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');`}</style>
    </div>
  )
}
