import { supabase } from './supabase'

export async function submitZellePayment({ amount, dueDate, referenceNote }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return supabase.from('payments').insert({
    tenant_id: user.id,
    amount,
    due_date: dueDate,
    method: 'zelle',
    status: 'pending',
    reference_note: referenceNote,
  })
}

export async function confirmPayment(paymentId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return supabase
    .from('payments')
    .update({
      status: 'confirmed',
      paid_date: new Date().toISOString().slice(0, 10),
      confirmed_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
    .eq('status', 'pending')
}

export async function rejectPayment(paymentId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return supabase
    .from('payments')
    .update({
      status: 'rejected',
      confirmed_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', paymentId)
    .eq('status', 'pending')
}

// ─── Future Stripe ACH stub ──────────────────────────────────────────────────
// export async function createStripePaymentIntent({ tenantId, amount }) { ... }
// export async function confirmStripePayment(paymentIntentId) { ... }
