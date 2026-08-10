'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'

export default function ClientSignupPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    ville: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!termsAccepted) {
      setError(t('signup.acceptTermsRequired'))
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('signup.passwordMismatch'))
      setLoading(false)
      return
    }

    try {
      console.log('Sending signup request with data:', {
        name: formData.name,
        email: formData.email,
        role: 'client',
        ville: formData.ville || null,
      })

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'client',
          ville: formData.ville || null,
        }),
      })

      const data = await response.json()
      console.log('Signup response:', data)

      if (!response.ok) {
        setError(data.error || t('signup.signupError'))
        setLoading(false)
        return
      }

      // If email verification is needed, redirect to check-email page
      if (data.needsEmailVerification) {
        router.push('/check-email')
      } else {
        router.push('/client-dashboard')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-8 md:py-12 px-4" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      <div className="max-w-lg w-full bg-white p-6 md:p-8 rounded-lg shadow-md space-y-6">

        {/* Photo Section */}
        <div className="flex justify-center mb-6">
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-4">
            <img
              src="/images/satisfied-clients.jpg"
              alt="Happy clients"
              className="w-full h-40 md:h-56 object-cover rounded-lg mb-4"
            />
            <h2 className="text-lg font-semibold mb-2 text-center">{t('home.satisfiedClients')}</h2>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
          {t('clientSignup.title')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clientSignup.lastName')} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clientSignup.email')} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clientSignup.password')} *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clientSignup.confirmPassword')} *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clientSignup.city')} *
            </label>
            <input
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              {t('signup.acceptTerms')}{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                {t('signup.termsOfService')}
              </Link>
            </label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t('clientSignup.creating') : t('clientSignup.create')}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          {t('signup.alreadyHaveAccount')}{' '}
          <Link href="/login" className="hover:text-gray-900 font-medium">
            {t('signup.goToLogin')}
          </Link>
        </div>
      </div>
    </main>
  )
}
