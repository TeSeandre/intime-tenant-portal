import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      if (cancelled) return
      setSession(s)
      if (s) {
        fetchProfile(s.user.id, () => cancelled)
      } else {
        setProfile(null)
        setProfileError(null)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s && !cancelled) setLoading(false)
    })

    return () => { cancelled = true; listener.subscription.unsubscribe() }
  }, [])

  async function fetchProfile(userId, isCancelled) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (isCancelled()) return
      if (error) throw error
      setProfile(data)
      setProfileError(null)
    } catch (err) {
      if (isCancelled()) return
      setProfile(null)
      setProfileError(err.message)
    } finally {
      if (!isCancelled()) setLoading(false)
    }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    isAdmin: profile?.role === 'admin',
    isTenant: profile?.role === 'tenant',
    loading,
    profileError,
    signIn,
    signOut,
  }
}
