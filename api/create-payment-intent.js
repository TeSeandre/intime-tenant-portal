import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Service-role client — bypasses RLS for server-side writes.
// This key is NOT exposed to the browser; it only lives in Vercel env vars.
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(raw)) }
      catch { reject(new Error('Invalid JSON body')) }
    })
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify the tenant's Supabase JWT
  const authHeader = req.headers['authorization'] ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }
  const token = authHeader.slice(7)

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  const { amount, dueDate } = body
  if (
    amount == null ||
    typeof amount !== 'number' ||
    amount <= 0 ||
    amount > 50000
  ) {
    return res.status(400).json({ error: 'Amount must be between $0.01 and $50,000' })
  }

  // Fetch profile to reuse an existing Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, full_name')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // Create the PaymentIntent for ACH debit
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency: 'usd',
    customer: customerId,
    payment_method_types: ['us_bank_account'],
    payment_method_options: {
      us_bank_account: {
        financial_connections: { permissions: ['payment_method'] },
      },
    },
    metadata: {
      supabase_user_id: user.id,
      due_date: dueDate ?? '',
    },
  })

  // Insert a processing record so the tenant sees it immediately
  const { data: payment, error: insertError } = await supabase
    .from('payments')
    .insert({
      tenant_id: user.id,
      amount,
      due_date: dueDate ?? null,
      method: 'ach',
      status: 'processing',
      stripe_payment_id: paymentIntent.id,
    })
    .select('id')
    .single()

  if (insertError) {
    // Don't leave a dangling PaymentIntent
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {})
    return res.status(500).json({ error: 'Failed to create payment record' })
  }

  return res.status(200).json({
    clientSecret: paymentIntent.client_secret,
    paymentId: payment.id,
  })
}
