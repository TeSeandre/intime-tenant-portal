/*
  3-DAY THEME ROTATION
  ────────────────────
  Day 0 mod 3 → Warm Earth   (deep espresso + tan + terracotta)
  Day 1 mod 3 → Deep Forest  (dark forest  + olive + warm cream)
  Day 2 mod 3 → Desert Clay  (warm linen   + terracotta + olive)
*/

const THEMES = {
  warmEarth: {
    name: "Warm Earth",
    isDark: true,
    bg: "#1A1612",
    bgAlt: "#1E1914",
    bgCard: "#211C17",
    bgHover: "#2A241D",
    bg60Lighter: "#241F1A",

    tan: "#C4A882",
    tanFaded: "rgba(196,168,130,0.10)",
    tanGhost: "rgba(196,168,130,0.22)",
    tanSoft: "rgba(196,168,130,0.5)",
    mid30: "#C4A882",
    mid30Faded: "rgba(196,168,130,0.12)",
    mid30Ghost: "rgba(196,168,130,0.25)",

    terra: "#C2703E",
    terraGlow: "rgba(194,112,62,0.25)",
    terraFaded: "rgba(194,112,62,0.08)",
    accent10: "#C2703E",
    accent10Glow: "rgba(194,112,62,0.25)",

    olive: "#6B8455",
    oliveGlow: "rgba(107,132,85,0.18)",
    oliveFaded: "rgba(107,132,85,0.10)",

    textDim: "rgba(196,168,130,0.35)",
    textMid: "rgba(196,168,130,0.6)",
    textMuted: "rgba(196,168,130,0.4)",
    textSoft: "rgba(196,168,130,0.6)",
    dim: "rgba(196,168,130,0.3)",
    mid: "rgba(196,168,130,0.55)",
    bright: "rgba(196,168,130,0.85)",
  },

  deepForest: {
    name: "Deep Forest",
    isDark: true,
    bg: "#0E1710",
    bgAlt: "#121A13",
    bgCard: "#162019",
    bgHover: "#1C2B1E",
    bg60Lighter: "#162019",

    tan: "#6B8455",
    tanFaded: "rgba(107,132,85,0.10)",
    tanGhost: "rgba(107,132,85,0.22)",
    tanSoft: "rgba(107,132,85,0.5)",
    mid30: "#6B8455",
    mid30Faded: "rgba(107,132,85,0.12)",
    mid30Ghost: "rgba(107,132,85,0.25)",

    terra: "#D4B896",
    terraGlow: "rgba(212,184,150,0.25)",
    terraFaded: "rgba(212,184,150,0.08)",
    accent10: "#D4B896",
    accent10Glow: "rgba(212,184,150,0.25)",

    olive: "#8FAB72",
    oliveGlow: "rgba(143,171,114,0.18)",
    oliveFaded: "rgba(143,171,114,0.10)",

    textDim: "rgba(107,132,85,0.4)",
    textMid: "rgba(107,132,85,0.7)",
    textMuted: "rgba(107,132,85,0.45)",
    textSoft: "rgba(107,132,85,0.65)",
    dim: "rgba(107,132,85,0.35)",
    mid: "rgba(107,132,85,0.6)",
    bright: "rgba(107,132,85,0.88)",
  },

  desertClay: {
    name: "Desert Clay",
    isDark: false,
    bg: "#F5EDE3",
    bgAlt: "#EDE3D6",
    bgCard: "#E8DDD0",
    bgHover: "#E0D4C4",
    bg60Lighter: "#EDE3D6",

    tan: "#B85A3A",
    tanFaded: "rgba(184,90,58,0.08)",
    tanGhost: "rgba(184,90,58,0.18)",
    tanSoft: "rgba(184,90,58,0.5)",
    mid30: "#B85A3A",
    mid30Faded: "rgba(184,90,58,0.08)",
    mid30Ghost: "rgba(184,90,58,0.2)",

    terra: "#556B44",
    terraGlow: "rgba(85,107,68,0.22)",
    terraFaded: "rgba(85,107,68,0.08)",
    accent10: "#556B44",
    accent10Glow: "rgba(85,107,68,0.22)",

    olive: "#8B6914",
    oliveGlow: "rgba(139,105,20,0.2)",
    oliveFaded: "rgba(139,105,20,0.10)",

    textDim: "rgba(44,28,16,0.35)",
    textMid: "rgba(44,28,16,0.6)",
    textMuted: "rgba(44,28,16,0.4)",
    textSoft: "rgba(44,28,16,0.65)",
    dim: "rgba(44,28,16,0.3)",
    mid: "rgba(44,28,16,0.6)",
    bright: "rgba(44,28,16,0.85)",
  },
}

const THEME_ORDER = ['warmEarth', 'deepForest', 'desertClay']

// UTC days since epoch mod 3 → picks the day's theme automatically
const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % 3

export const currentThemeKey = THEME_ORDER[dayIndex]
export const T = THEMES[currentThemeKey]
export { THEMES, THEME_ORDER }
export default T
