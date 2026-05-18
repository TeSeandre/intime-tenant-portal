import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [mode, setMode] = useState('login') // 'login' | 'recovery' | 'forgot'
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    async function handleAuthCallback() {
      // Method 1: code param (newer Supabase PKCE flow)
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code)
        window.history.replaceState(null, '', window.location.pathname)
        if (exchangeErr) {
          setError('Link expired or invalid. Request a new one.')
          return
        }
        if (data?.session) {
          setMode('recovery')
        }
        return
      }

      // Method 2: hash fragment (older Supabase implicit flow)
      const hash = window.location.hash
      if (!hash) return

      const hashParams = new URLSearchParams(hash.replace('#', ''))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')

      if (!accessToken) return

      const { data, error: sessionErr } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') ?? '',
      })

      window.history.replaceState(null, '', window.location.pathname)

      if (sessionErr) {
        setError('Link expired or invalid. Request a new one.')
        return
      }

      if (type === 'recovery' || data?.session) {
        setMode('recovery')
      }
    }

    handleAuthCallback()
  }, [])

  async function handleLogin() {
    if (!email || !password) {
      setError('Email and password are required.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const data = await signIn(email, password)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      navigate(profile?.role === 'admin' ? '/admin/dashboard' : '/tenant/dashboard')
    } catch (err) {
      setError(err.message ?? 'Login failed. Check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSetPassword() {
    if (!newPassword || newPassword.length < 12) {
      setError('Password must be at least 12 characters.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
      if (updateErr) throw updateErr
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      navigate(profile?.role === 'admin' ? '/admin/dashboard' : '/tenant/dashboard')
    } catch (err) {
      setError(err.message ?? 'Failed to set password.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email address.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: (import.meta.env.VITE_APP_URL ?? window.location.origin) + '/reset-password',
      })
      if (resetErr) throw resetErr
      setResetSent(true)
    } catch (err) {
      setError(err.message ?? 'Failed to send reset email.')
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(newMode) {
    setMode(newMode)
    setError(null)
    setResetSent(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (mode === 'recovery') handleSetPassword()
      else if (mode === 'forgot') handleForgotPassword()
      else handleLogin()
    }
  }

  return (
    <div className='min-h-screen bg-brand-cream flex items-center justify-center px-4'>
      <div className='bg-white rounded-2xl shadow-md w-full max-w-sm p-8'>
        <div className='mb-8 text-center'>
          <h1 className='text-2xl font-bold text-brand-charcoal'>
            InTime<span className='text-brand-terra'>Realty</span>
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            {mode === 'recovery' ? 'Set New Password' : mode === 'forgot' ? 'Reset Password' : 'Tenant Portal'}
          </p>
        </div>

        {error && (
          <div className='mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700'>
            {error}
          </div>
        )}

        {mode === 'recovery' ? (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <label className='text-sm font-medium text-brand-charcoal' htmlFor='newPassword'>
                New Password
              </label>
              <input
                id='newPassword'
                type='password'
                autoComplete='new-password'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-terra'
                placeholder='Min 12 characters'
              />
            </div>
            <button
              onClick={handleSetPassword}
              disabled={submitting}
              className='mt-2 bg-brand-terra text-white rounded-lg py-2 text-sm font-semibold hover:bg-brand-terra-dk transition-colors disabled:opacity-50'
            >
              {submitting ? 'Saving...' : 'Set Password'}
            </button>
          </div>
        ) : mode === 'forgot' ? (
          <div className='flex flex-col gap-4'>
            {resetSent ? (
              <p className='text-center text-sm text-green-600'>
                Reset email sent! Check your inbox and click the link to set a new password.
              </p>
            ) : (
              <>
                <div className='flex flex-col gap-1'>
                  <label className='text-sm font-medium text-brand-charcoal' htmlFor='resetEmail'>
                    Email
                  </label>
                  <input
                    id='resetEmail'
                    type='email'
                    autoComplete='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-terra'
                    placeholder='you@example.com'
                  />
                </div>
                <button
                  onClick={handleForgotPassword}
                  disabled={submitting}
                  className='mt-2 bg-brand-terra text-white rounded-lg py-2 text-sm font-semibold hover:bg-brand-terra-dk transition-colors disabled:opacity-50'
                >
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </>
            )}
            <button
              type='button'
              onClick={() => switchMode('login')}
              className='text-center text-xs text-gray-400 hover:text-brand-terra transition-colors underline underline-offset-2'
            >
              Back to login
            </button>
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <label className='text-sm font-medium text-brand-charcoal' htmlFor='email'>
                Email
              </label>
              <input
                id='email'
                type='email'
                autoComplete='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-terra'
                placeholder='you@example.com'
              />
            </div>

            <div className='flex flex-col gap-1'>
              <label className='text-sm font-medium text-brand-charcoal' htmlFor='password'>
                Password
              </label>
              <input
                id='password'
                type='password'
                autoComplete='current-password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-terra'
                placeholder='••••••••'
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={submitting}
              className='mt-2 bg-brand-terra text-white rounded-lg py-2 text-sm font-semibold hover:bg-brand-terra-dk transition-colors disabled:opacity-50'
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type='button'
              onClick={() => switchMode('forgot')}
              disabled={submitting}
              className='text-center text-xs text-gray-400 hover:text-brand-terra transition-colors underline underline-offset-2 disabled:opacity-50'
            >
              Forgot password?
            </button>
          </div>
        )}

        <p className='mt-6 text-center text-xs text-gray-400'>
          Contact your property manager to set up your account.
        </p>
      </div>
    </div>
  )
}
