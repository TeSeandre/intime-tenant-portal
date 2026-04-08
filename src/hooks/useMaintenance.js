import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Loads maintenance tickets for a given tenant (or all tickets for admins
 * when tenantId is null and adminMode is true).
 *
 * @param {string|null} tenantId  - null for admin "all tickets" view
 * @param {boolean} adminMode
 */
export function useMaintenance(tenantId, adminMode = false) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    try {
      let query = supabase
        .from('maintenance')
        .select('*, tenants(name, email, unit_id), units(address, unit_number)')
        .order('created_at', { ascending: false })

      if (!adminMode && tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error: fetchErr } = await query
      if (fetchErr) throw fetchErr
      setTickets(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminMode && !tenantId) return
    load()
  }, [tenantId, adminMode])

  async function updateStatus(ticketId, newStatus, updatedBy) {
    try {
      const updates = {
        status: newStatus,
        updated_by: updatedBy,
      }
      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString()
      }
      const { error: updateErr } = await supabase
        .from('maintenance')
        .update(updates)
        .eq('id', ticketId)
      if (updateErr) throw updateErr
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return { tickets, loading, error, refetch: load, updateStatus }
}
