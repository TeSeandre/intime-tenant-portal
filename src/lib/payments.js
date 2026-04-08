/**
 * Payment abstraction layer — v1 is Zelle (manual confirmation).
 * When migrating to Stripe ACH, replace the stubs below without
 * touching call-sites in components.
 */

import { supabase } from './supabase'

/**
 * Tenant submits a payment notification.
 * Creates a pending payment record; an admin must confirm it separately.
 *
 * @param {{ tenantId: string, amount: number, dueDate: string, referenceNote: string }} opts
 * @returns {Promise<{ data, error }>}
 */
export async function submitZellePayment({ tenantId, amount, dueDate, referenceNote }) {
  return supabase.from('payments').insert({
    tenant_id: tenantId,
    amount,
    due_date: dueDate,
    method: 'zelle',
    status: 'pending',
    reference_note: referenceNote,
  })
}

/**
 * Admin confirms a pending payment.
 *
 * @param {string} paymentId
 * @param {string} adminId
 * @returns {Promise<{ data, error }>}
 */
export async function confirmPayment(paymentId, adminId) {
  return supabase
    .from('payments')
    .update({
      status: 'confirmed',
      paid_date: new Date().toISOString().slice(0, 10),
      confirmed_by: adminId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
}

/**
 * Admin rejects a pending payment.
 *
 * @param {string} paymentId
 * @param {string} adminId
 * @returns {Promise<{ data, error }>}
 */
export async function rejectPayment(paymentId, adminId) {
  return supabase
    .from('payments')
    .update({
      status: 'rejected',
      confirmed_by: adminId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
}

// ─── Future Stripe ACH stub ──────────────────────────────────────────────────
// export async function createStripePaymentIntent({ tenantId, amount }) { ... }
// export async function confirmStripePayment(paymentIntentId) { ... }
