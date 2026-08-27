'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../components/AuthProvider'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'
import { useSearchParams } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  role: 'client' | 'artisan'
  name?: string
  phone?: string
  location?: string
  metier?: string
  isPaid?: boolean
}

function LoginContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const { login } = useAuth()

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccessMessage(t('verification.emailVerified') || 'Email verified successfully. Please log in.')
    }
  }, [searchParams, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const result = await login(formData.email, formData.password)

      if (!result) {
        setError(t('login.incorrectCredentials'))
        setIsLoading(false)
        return
      }

      // Login successful - redirect based on role
      const userProfile = result as UserProfile
      const requestedRedirect = searchParams.get('redirect')
      const redirectPath = requestedRedirect?.startsWith('/') && !requestedRedirect.startsWith('//')
        ? requestedRedirect
        : null

      if (redirectPath) window.location.href = redirectPath
      else if (userProfile.role === 'client') window.location.href = '/client-dashboard'
      else if (userProfile.role === 'artisan') window.location.href = '/artisan-dashboard'
      else setError(t('login.noRole'))

    } catch {
      setError(t('login.genericError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      <div className="w-full max-w-md px-4 py-16">

        {/* Login Form */}
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t('login.title')}</h1>

          {error && (
            <p className="text-red-600 text-center mb-4">{error}</p>
          )}

          {successMessage && (
            <p className="text-green-600 text-center mb-4">{successMessage}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-medium">{t('login.email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">{t('login.password')}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition"
            >
              {isLoading ? t('common.loading') : t('login.button')}
            </button>
          </form>

          {/* FIXED LINE BELOW */}
          <div className="text-center mt-6">
            <Link href="/forgot-password" className="text-green-700 hover:underline">
              {t('login.forgotPassword')}
            </Link>
          </div>

          <div className="text-center mt-4">
            <Link href="/signup" className="text-green-700 hover:underline">
              {t('login.noAccount')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}><p>Loading...</p></div>}>
      <LoginContent />
    </Suspense>
  )
}
