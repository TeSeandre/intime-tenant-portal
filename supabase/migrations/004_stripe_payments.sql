-- ============================================================
-- Migration 004 — Stripe ACH Payments
-- ============================================================

-- Store Stripe customer ID on the profile so we reuse the same customer
-- across multiple payments instead of creating a new one each time.
alter table profiles
  add column if not exists stripe_customer_id text;

-- Track the Stripe PaymentIntent and PaymentMethod IDs on each payment row.
alter table payments
  add column if not exists stripe_payment_id text,
  add column if not exists stripe_payment_method_id text;

-- Expand the status enum to cover the ACH lifecycle:
--   processing → payment submitted to ACH network, awaiting settlement
--   failed     → ACH returned / PaymentIntent failed
-- We keep the existing Zelle statuses (pending, confirmed, late, rejected).
alter table payments
  drop constraint if exists payments_status_check;

alter table payments
  add constraint payments_status_check
  check (status in ('pending', 'processing', 'confirmed', 'failed', 'late', 'rejected'));
