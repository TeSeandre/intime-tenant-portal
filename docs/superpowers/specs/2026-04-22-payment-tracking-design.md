# Payment Tracking System — Design Spec
Date: 2026-04-22
Project: In Time Realty Tenant Portal

## Summary

Zero-cost rent payment tracking. Money moves via Zelle (external). Portal tracks submissions, confirmations, history. No payment processor. No fees.

## Decision

- Method: Zelle (external transfer)
- In-portal: tenant submits proof, admin confirms
- Future path: Stripe ACH when 20+ units

## User Flows

### Tenant
1. Dashboard shows rent due amount + due date
2. "Pay Rent" → displays Zelle info (email/phone) + exact amount
3. Pays via Zelle outside app
4. Returns → "I Paid" → form: amount, date, note, optional screenshot
5. Creates `payments` row with `status = 'pending'`
6. Dashboard shows "Payment pending confirmation"
7. On confirm/reject → status updates, visible in history

### Admin
1. Notification badge shows count of pending payments
2. Payments tab → pending queue
3. Click payment → detail view: tenant, amount, date, note, screenshot
4. Confirm → `status = 'confirmed'`, `confirmed_by`, `paid_date` set
5. Reject → `status = 'rejected'`, tenant sees rejection in dashboard
6. Full ledger view: all payments, all statuses, all tenants

## Data Model

No new tables needed. Uses existing schema.

### `payments` (existing)
```
id            uuid PK
tenant_id     uuid FK → tenants.id
amount        numeric
due_date      date (nullable)
paid_date     date (nullable) — set on admin confirm
method        text default 'zelle'
status        text: pending | confirmed | late | rejected
reference_note text (nullable) — tenant's note
confirmed_by  uuid FK → auth.users (nullable) — admin who confirmed
created_at    timestamptz
updated_at    timestamptz
```

### Storage
- Bucket: `payment-receipts`
- Path: `{tenant_id}/{payment_id}/receipt.{ext}`
- RLS: uploader + admin role can read; public = false

### `charges` (existing — for late fees)
```
type: 'late_fee' | 'rent' | 'deposit' | 'other'
```
Admin manually adds late fee charge. Auto-trigger is phase 2.

## Components

| Component | Viewer | Purpose |
|-----------|--------|---------|
| `PayRentCard` | Tenant | Amount due, Zelle info, "I Paid" CTA |
| `PaymentSubmitModal` | Tenant | Form: amount, date, note, screenshot |
| `PaymentStatusBadge` | Both | Status pill: pending/confirmed/late/rejected |
| `PaymentHistory` | Both | Paginated list of payments with status |
| `AdminPaymentQueue` | Admin | Pending payments needing action |
| `PaymentDetailModal` | Admin | Full detail + confirm/reject buttons |
| `PaymentNotificationBadge` | Admin | Unconfirmed count in nav |

## Zelle Info

Stored in env var `VITE_ZELLE_EMAIL` and `VITE_ZELLE_NAME`. Displayed statically in `PayRentCard`. No API, no redirect.

## Security / RLS

- Tenant: INSERT own payments only (`tenant_id = auth.uid()` via tenants join)
- Tenant: SELECT own payments only
- Tenant: no UPDATE (cannot self-confirm)
- Admin: SELECT all payments
- Admin: UPDATE status, confirmed_by, paid_date
- Storage bucket: private, RLS enforces tenant owns file or role = admin

## Notifications

Phase 1 (in-app only):
- Admin nav badge: count of `status = 'pending'` payments
- Tenant dashboard: current payment status visible

Phase 2 (future):
- Supabase Edge Function → email on submission (to admin) and on confirm/reject (to tenant)

## Out of Scope

- Automated late fee triggers
- Email notifications
- Recurring payment schedules
- Stripe / ACH integration
- Payment disputes

## Success Criteria

- Tenant can submit payment proof in < 2 minutes
- Admin can confirm/reject in 1 click
- Both sides see accurate payment history
- Zero dollars in processing fees
