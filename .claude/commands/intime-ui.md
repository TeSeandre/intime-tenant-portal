# IN TIME REALTY — UI / Component Skill

You are building UI for the **IN TIME REALTY Tenant Portal**, a React + Supabase + Tailwind CSS app.
Every response you give must be consistent with the design system, file conventions, and animation
patterns described below. Do not invent a new color, font, layout, or animation style — always
derive it from what already exists in `src/lib/theme.js` and the patterns in `src/components/`.

---

## Design Philosophy

> "Simple enough for an older person, cool enough for a young person to admire."

- Prioritize legibility and calm hierarchy over decoration.
- Use animation to *communicate state*, not to show off.
- Every visual element should feel intentional within the Warm Earth / Deep Forest / Desert Clay palette.

---

## Color System — always consume `T` from `src/lib/theme.js`

```js
import T from '../../lib/theme'   // or correct relative path
```

The `T` object is the **only** source of color. Never hardcode hex values or use Tailwind `brand-*`
classes in new components — those classes are a legacy from the initial scaffold.

### Token reference

| Token | Role | Example value (Warm Earth) |
|---|---|---|
| `T.bg` | 60% dominant — page/section background | `#1A1612` |
| `T.bgAlt` | Slightly lighter bg for alternating rows | `#1E1914` |
| `T.bgCard` | Card surface | `#211C17` |
| `T.bgHover` | Card hover state | `#2A241D` |
| `T.tan` / `T.mid30` | 30% structural — borders, text, labels | `#C4A882` |
| `T.tanFaded` | Ghost border / subtle divider | `rgba(196,168,130,0.10)` |
| `T.tanGhost` | Hover overlay, selected row tint | `rgba(196,168,130,0.22)` |
| `T.terra` / `T.accent10` | 10% accent — CTAs, active tabs, highlights | `#C2703E` |
| `T.terraGlow` | Glow shadow on buttons/badges | `rgba(194,112,62,0.25)` |
| `T.terraFaded` | Accent background tint | `rgba(194,112,62,0.08)` |
| `T.olive` | Success states, active badges, secondary accent | `#6B8455` |
| `T.oliveGlow` | Glow on success elements | `rgba(107,132,85,0.18)` |
| `T.textDim` | Disabled / placeholder text | `rgba(196,168,130,0.35)` |
| `T.textMid` | Body text | `rgba(196,168,130,0.6)` |
| `T.bright` | Headings / primary text | `rgba(196,168,130,0.85)` |

### 60-30-10 enforcement

| % | Use | Token |
|---|---|---|
| 60 | Backgrounds, large surfaces, sections | `T.bg`, `T.bgAlt`, `T.bgCard` |
| 30 | Text, borders, structural lines | `T.tan`, `T.textMid`, `T.tanFaded` |
| 10 | CTAs, active states, highlights | `T.terra`, `T.terraGlow` |

Olive (`T.olive`) is a controlled *supporting* accent — limit it to success badges, completed
states, and secondary illustrations. Never use it as a dominant color.

---

## Typography

| Use | Font | Weight |
|---|---|---|
| All UI text, labels, body | DM Sans | 300 / 400 / 500 |
| Section headers, hero headline | Playfair Display | 400 / 500 |
| Financial figures, dates, IDs | DM Mono | 400 |

Google Fonts import is already in `index.html`. Reference via:
```js
fontFamily: 'DM Sans, sans-serif'
fontFamily: '"Playfair Display", Georgia, serif'
fontFamily: '"DM Mono", monospace'
```

---

## Animation Standards

### Easing curves

| Purpose | Curve |
|---|---|
| Pop-in elements (buttons, cards, toasts) | `cubic-bezier(0.34, 1.56, 0.64, 1)` — spring bounce |
| Fade / slide on scroll | `cubic-bezier(0.4, 0, 0.2, 1)` — ease-in-out |
| Number counters | `cubic-bezier(0, 0, 0.2, 1)` — ease-out (natural deceleration) |

### Duration guidelines

| Interaction | Duration |
|---|---|
| Button state change | 200–300 ms |
| Card hover | 200 ms |
| Toast slide-in | 300–400 ms |
| Modal/panel open | 350–500 ms |
| House build (hero) | 280 ms per phase, 2.4 s total |
| Scroll reveal | 400–600 ms |

### Scroll-triggered reveals

Use `IntersectionObserver` — **not** an animation library — for scroll reveals unless Framer Motion
is already installed in the project.

```js
useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) setVisible(true) },
    { threshold: 0.15 }
  )
  if (ref.current) observer.observe(ref.current)
  return () => observer.disconnect()
}, [])
```

Fade-up pattern:
```js
style={{
  opacity: visible ? 1 : 0,
  transform: visible ? 'translateY(0)' : 'translateY(20px)',
  transition: 'opacity 0.5s ease, transform 0.5s ease',
  transitionDelay: `${delay}ms`,
}}
```

### Keyframe animations (add to `index.css` or a `<style>` block)

```css
/* Shimmer sweep — used on processing buttons */
@keyframes shimmer {
  0%   { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(200%) skewX(-15deg); }
}

/* Glow pulse — used on active/success elements */
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(194,112,62,0.3); }
  50%       { box-shadow: 0 0 20px rgba(194,112,62,0.6); }
}

/* Smoke drift — chimney animation on HouseSpinner */
@keyframes smokeDrift {
  0%   { opacity: 0.6; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-20px) scale(1.8); }
}

/* Stat counter number tick */
@keyframes countUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## Component Patterns

### Card

```jsx
<div style={{
  background: T.bgCard,
  border: `1px solid ${T.tanFaded}`,
  borderRadius: 12,
  padding: '20px 24px',
  transition: 'background 0.2s ease, box-shadow 0.2s ease',
}}
  onMouseEnter={e => {
    e.currentTarget.style.background = T.bgHover
    e.currentTarget.style.boxShadow = `0 4px 24px ${T.terraGlow}`
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = T.bgCard
    e.currentTarget.style.boxShadow = 'none'
  }}
>
```

### Primary CTA button (terracotta)

```jsx
<button style={{
  background: T.terra,
  color: T.bg,
  fontFamily: 'DM Sans, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  padding: '10px 24px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
}}
  onMouseEnter={e => {
    e.currentTarget.style.transform = 'translateY(-1px)'
    e.currentTarget.style.boxShadow = `0 6px 20px ${T.terraGlow}`
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = 'none'
  }}
>
```

### Status badge

```jsx
// Active / success
<span style={{
  background: T.oliveFaded,
  color: T.olive,
  border: `1px solid ${T.oliveGlow}`,
  borderRadius: 20, padding: '3px 10px',
  fontSize: 11, fontWeight: 500,
  fontFamily: 'DM Sans, sans-serif',
  letterSpacing: '0.04em', textTransform: 'uppercase',
}}>Active</span>

// Warning / pending
<span style={{
  background: T.terraFaded,
  color: T.terra,
  border: `1px solid ${T.terraGlow}`,
  borderRadius: 20, padding: '3px 10px',
  fontSize: 11, fontWeight: 500,
}}>Pending</span>
```

### Section header (Playfair + DM Sans combo)

```jsx
<h2 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 400, color: T.tan, fontSize: 28, marginBottom: 8 }}>
  Section Title
</h2>
<p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 300, color: T.textMid, fontSize: 15 }}>
  Supporting description text.
</p>
```

### Financial figure (DM Mono)

```jsx
<span style={{ fontFamily: '"DM Mono", monospace', fontSize: 20, color: T.tan, fontWeight: 400 }}>
  $1,450.00
</span>
```

### Input field (with focus glow)

```jsx
<input
  style={{
    background: T.bgAlt,
    border: `1px solid ${T.tanFaded}`,
    color: T.tan,
    borderRadius: 8,
    padding: '10px 14px',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  }}
  onFocus={e => {
    e.target.style.borderColor = T.terra
    e.target.style.boxShadow = `0 0 0 3px ${T.terraGlow}`
  }}
  onBlur={e => {
    e.target.style.borderColor = T.tanFaded
    e.target.style.boxShadow = 'none'
  }}
/>
```

### Divider

```jsx
<hr style={{ border: 'none', borderTop: `1px solid ${T.tanFaded}`, margin: '16px 0' }} />
```

---

## File Conventions

| What | Where |
|---|---|
| New tenant-facing page | `src/components/tenant/MyPage.jsx` |
| New admin page | `src/components/admin/MyPage.jsx` |
| Shared/reusable component | `src/components/shared/MyComponent.jsx` |
| New hook | `src/hooks/useMyHook.js` |
| New utility/service | `src/lib/myUtil.js` |
| Theme tokens | `src/lib/theme.js` — read only, do not modify unless explicitly told to |
| Route registration | `src/App.jsx` — add inside `RequireTenant` or `RequireAdmin` wrapper |

All new components import T at the top:
```js
import T from '../../lib/theme'  // adjust relative path
```

---

## Supabase Patterns

### Auth — always use the `useAuth` hook

```js
import { useAuth } from '../../hooks/useAuth'
const { session, profile, isAdmin, isTenant, signOut } = useAuth()
```

Never call `supabase.auth` directly inside a component.

### Data fetching — inline `useEffect` or a dedicated hook

```js
import { supabase } from '../../lib/supabase'

useEffect(() => {
  async function load() {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', profile.id)
      .order('created_at', { ascending: false })
    if (!error) setPayments(data)
  }
  if (profile) load()
}, [profile])
```

### Key tables & relationships

| Table | Primary key | Notable columns |
|---|---|---|
| `profiles` | `id` (= auth.uid) | `role` (tenant/admin), `full_name`, `avatar_url` |
| `units` | `id` | `address`, `bedrooms`, `bathrooms`, `rent_amount` |
| `tenants` | `id` | `user_id`, `unit_id`, `lease_start`, `lease_end`, `emergency_contact_*` |
| `payments` | `id` | `tenant_id`, `amount`, `status` (pending/confirmed/late/rejected), `payment_date` |
| `charges` | `id` | `tenant_id`, `type` (rent/late_fee/deposit/other), `amount`, `due_date` |
| `maintenance` | `id` | `tenant_id`, `unit_id`, `category`, `priority`, `status`, `description` |
| `messages` | `id` | `thread_id`, `sender_id`, `body`, `created_at` |
| `leases` | `id` | `tenant_id`, `pdf_url`, `signed_at`, `signature_data` |
| `announcements` | `id` | `title`, `body`, `created_by`, `created_at` |

### Realtime subscription pattern

```js
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
      payload => setMessages(prev => [...prev, payload.new])
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}, [])
```

---

## Routing

Add tenant pages inside `RequireTenant`, admin pages inside `RequireAdmin`:
```jsx
<Route path='/tenant/my-new-page' element={<RequireTenant><MyNewPage /></RequireTenant>} />
```

`NavLayout` in `src/components/shared/NavLayout.jsx` renders the sidebar nav — add new nav
items there when adding a page that needs top-level navigation.

---

## House Loading / Spinner

Use `<HouseSpinner />` (`src/components/shared/HouseSpinner.jsx`) for any in-page loading states:
```jsx
import HouseSpinner from '../shared/HouseSpinner'
if (loading) return <HouseSpinner />
```

The full 8-phase house-build is in `src/components/HouseLoading.jsx` — for login splash only.

---

## Page Wrapper Template

Every new page should follow this shell:

```jsx
import { useState, useEffect } from 'react'
import T from '../../lib/theme'
import { useAuth } from '../../hooks/useAuth'
import NavLayout from '../shared/NavLayout'
import HouseSpinner from '../shared/HouseSpinner'

export default function MyPage() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])

  useEffect(() => {
    // fetch data here
    setLoading(false)
  }, [profile])

  return (
    <NavLayout>
      <div style={{ background: T.bg, minHeight: '100vh', padding: '32px 24px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: '"Playfair Display", serif', color: T.tan, fontSize: 28, fontWeight: 400, margin: 0 }}>
            Page Title
          </h1>
          <p style={{ color: T.textMid, fontFamily: 'DM Sans, sans-serif', fontSize: 14, marginTop: 6 }}>
            Supporting description.
          </p>
        </div>

        {loading ? <HouseSpinner /> : (
          /* main content */
          <div />
        )}

      </div>
    </NavLayout>
  )
}
```

---

## Do / Don't Quick Reference

| Do | Don't |
|---|---|
| Import `T` from `theme.js` for every color | Hardcode hex values |
| Use `DM Sans` for UI text, `DM Mono` for numbers | Use Inter (that's the legacy Tailwind default) |
| Animate state transitions at 200–400 ms | Use transitions > 600 ms |
| Use `T.olive` for success/completed states only | Use olive as a primary accent |
| Gate data behind `useAuth()` profile check | Call `supabase.auth` directly in components |
| Use `<HouseSpinner />` for loading | Use a generic spinner or skeleton |
| Put pages in `tenant/` or `admin/` folder | Dump new pages in `components/` root |
| Use spring easing `cubic-bezier(0.34,1.56,0.64,1)` for pop-ins | Use `ease` or `linear` for interactive elements |

---

*IN TIME REALTY — An Omnivation Company — Wichita, KS*
