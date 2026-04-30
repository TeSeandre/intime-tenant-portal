# InTime Tenant Portal — Handoff

## What this is
Property management portal. Two roles: **admin** (landlord) and **tenant**. Live at https://intime-tenant-portal.vercel.app/

## Stack
- **Frontend:** Vite + React 19 + Tailwind CSS + React Router v7
- **Backend:** Supabase (Postgres + Auth + Storage) — project ID `hbazaqgelzsvufcqitxc`
- **Deployment:** Vercel (auto-deploys from git)
- **Plan:** Supabase free tier

## Project structure
```
src/
  components/
    admin/          # Admin-only pages (dashboard, tenant list, payments, maintenance, announcements)
    tenant/         # Tenant-only pages (dashboard, payments, lease, maintenance, inbox, profile)
    shared/         # LoginPage, NavLayout, HouseSpinner, FileUpload, etc.
  hooks/
    useAuth.js      # Auth state, signIn, signOut, profile fetch
  lib/
    supabase.js     # Supabase client (uses VITE_ env vars)
    payments.js     # submitZellePayment, confirmPayment, rejectPayment
    pdfUtils.js     # PDF generation
    theme.js        # Design tokens
```

## Auth flow
- Single `/login` route for both roles
- After login, redirects to `/admin/dashboard` or `/tenant/dashboard` based on `profiles.role`
- Password reset: Supabase emails link → user lands on `/reset-password` → sets new password
- Route guards: `RequireAdmin` and `RequireTenant` in `App.jsx` (client-side redirect only — RLS enforces server-side)

## Database tables
| Table | Who can read | Who can write |
|-------|-------------|---------------|
| `profiles` | Own row (tenant), all rows (admin) | Own row — cannot change `role` |
| `tenants` | Own row (tenant), all (admin) | Own row (tenant), all (admin) |
| `units` | Own unit (tenant), all (admin) | Admin only |
| `leases` | Own lease (tenant), all (admin) | Tenant can sign own unsigned lease; admin full access |
| `payments` | Own (tenant), all (admin) | Tenant INSERT own only; admin full access |
| `charges` | Own (tenant), all (admin) | Admin only |
| `maintenance` | Own (tenant), all (admin) | Tenant INSERT + UPDATE open tickets; admin full access |
| `messages` | sender or recipient | sender only on INSERT |
| `announcements` | All authenticated (tenant), all (admin) | Admin only |

## Security status (as of 2026-04-21)
All critical vulnerabilities fixed:
- Role escalation patched — tenants cannot promote themselves to admin
- Payment `tenant_id` resolved from `auth.getUser()`, not caller input
- Lease signing RLS policy added (was silently failing before)
- `SUPABASE_SERVICE_ROLE_KEY` removed from `.env`

**Pending (requires Supabase Pro):**
- Leaked password protection (HaveIBeenPwned check)
- Custom rate limit configuration

## Environment variables
```
VITE_SUPABASE_URL=       # Safe to expose (public)
VITE_SUPABASE_ANON_KEY=  # Safe to expose (public, RLS-enforced)
VITE_APP_ENV=            # development | production
```
Never add `SUPABASE_SERVICE_ROLE_KEY` to this project. Use it only in Supabase Edge Functions.

## Running locally
```bash
npm install
npm run dev
```

## Deploying
Push to main branch — Vercel auto-deploys. Set env vars in Vercel dashboard (not in `.env`).

## Known gaps / future work
- Mobile app version (React Native / Expo) — not yet scoped
- Stripe ACH payments (stubs in `payments.js`, currently Zelle manual flow)
- Leaked password protection + custom rate limits (needs Pro plan)
