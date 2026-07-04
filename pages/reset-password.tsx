'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [hasValidSession, setHasValidSession] = useState(false)

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')

    if (!code) {
      setHasValidSession(false)
      return
    }

    const run = async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Recovery error:', error)
        setHasValidSession(false)
      } else if (data?.session) {
        setHasValidSession(true)
      }
    }

    run()
  }, [supabase])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!hasValidSession) {
      setError('Invalid or expired reset link')
      setIsLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setError(updateError.message || 'Error updating password')
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  if (!hasValidSession) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid or expired link</h2>
          <p className="mb-6">Please request a new password reset link.</p>
          <a href="/forgot-password" className="btn-primary">Request new link</a>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Password reset!</h2>
          <p className="mb-4">You will be redirected to login…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-6 rounded shadow">
        <h2 className="text-3xl font-bold mb-6 text-center">Reset password</h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700">{error}</div>}

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 border rounded mb-4"
          required
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 border rounded mb-6"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-700 text-white py-3 rounded"
        >
          {isLoading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </main>
  )
}
