import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Loads the full ledger for a tenant:
 *   balance = sum(charges) - sum(confirmed payments)
 *
 * @param {string} tenantId
 */
export function useLedger(tenantId) {
  const [charges, setCharges] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!tenantId) return

    async function load() {
      setLoading(true)
      try {
        const [chargesRes, paymentsRes] = await Promise.all([
          supabase
            .from('charges')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('date', { ascending: false }),
          supabase
            .from('payments')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false }),
        ])

        if (chargesRes.error) throw chargesRes.error
        if (paymentsRes.error) throw paymentsRes.error

        setCharges(chargesRes.data)
        setPayments(paymentsRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [tenantId])

  const totalCharged = charges.reduce((sum, c) => sum + Number(c.amount), 0)
  const totalPaid = payments
    .filter(p => p.status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const balance = totalCharged - totalPaid

  return { charges, payments, balance, totalCharged, totalPaid, loading, error }
}
