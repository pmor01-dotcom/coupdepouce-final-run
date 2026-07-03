'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasValidSession, setHasValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        // Try to let Supabase parse the session/token from the URL (access_token, refresh_token, recovery flows)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSessionFromUrl({ storeSession: true })
        if (sessionError) {
          console.warn('getSessionFromUrl error:', sessionError)
        }

        if (sessionData?.session) {
          setHasValidSession(true)
          setCheckingSession(false)
          return
        }

        // Fallback: check for an OAuth-style `code` param and exchange it
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Recovery error:', error)
            setHasValidSession(false)
          } else {
            setHasValidSession(true)
          }
          setCheckingSession(false)
          return
        }

        // No session found
        setHasValidSession(false)
      } catch (err) {
        console.error('Reset session check error:', err)
        setHasValidSession(false)
      } finally {
        setCheckingSession(false)
      }
    }

    run()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    try {
      // Preferred path: if we have a reset session client-side, update via Supabase SDK
      if (hasValidSession) {
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
        if (updateError) {
          setError(updateError.message || 'Error updating password')
          setIsLoading(false)
          return
        }

        // Best-effort: call server endpoint to update password hash in DB (server reads session cookie set by getSessionFromUrl)
        try {
          await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
          })
        } catch (err) {
          console.error('Failed to call server reset endpoint:', err)
        }

        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
        return
      }

      // Fallback: call server route which validates session server-side
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setError(data.error || 'Error resetting password')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
        <div className="max-w-md w-full text-center">
          <p>Verifying...</p>
        </div>
      </main>
    )
  }

  if (!hasValidSession) {
    return (
      <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
        <div className="max-w-md w-full">
          <div className="card text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid or expired link</h2>
            <p className="text-gray-600 mb-6">
              This reset link is no longer valid. Please request a new link.
            </p>
            <Link href="/forgot-password" className="btn-primary inline-block">
              Request new link
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
        <div className="max-w-md w-full">
          <div className="card text-center p-8">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password reset!</h2>
              <p className="text-gray-600 mb-4">Your password has been successfully updated.</p>
              <p className="text-sm text-gray-500">You will be redirected to the login page...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset password</h2>
            <p className="text-gray-600">Enter your new password</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
