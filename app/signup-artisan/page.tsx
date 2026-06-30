'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'

export default function ArtisanSignupPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    ville: '',
    metier: '',
    phone: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    console.log('Form submitted with data:', formData)

    if (formData.password !== formData.confirmPassword) {
      setError(t('signup.passwordMismatch'))
      setLoading(false)
      return
    }

    try {
      console.log('Sending signup request to /api/auth/signup')
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'artisan',
          ville: formData.ville,
          metier: formData.metier,
          phone: formData.phone,
        }),
      })

      console.log('Response received:', response.status, response.statusText)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        setError(data.error || t('signup.signupError'))
        setLoading(false)
        return
      }

      // If email verification is needed, redirect to check-email page
      if (data.needsEmailVerification) {
        router.push('/check-email')
      } else {
        router.push('/artisan-dashboard')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-8 md:py-12 px-4 bg-gradient-to-b from-green-700 to-green-200">
      <div className="max-w-lg w-full bg-white p-6 md:p-8 rounded-lg shadow-md space-y-6">

        {/* Photo Section */}
        <div className="flex justify-center mb-6">
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg p-4">
            <img
              src="/images/artisan-photo-right.jpg"
              alt="Professional artisans"
              className="w-full h-40 md:h-56 object-cover rounded-lg mb-4"
            />
            <h2 className="text-lg font-semibold mb-2 text-center">{t('home.qualifiedArtisans')}</h2>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
          {t('artisanSignup.title')}
        </h2>

        <p className="text-center text-gray-600">
          {t('artisanSignup.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('artisanSignup.fullName')} *
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
              {t('artisanSignup.email')} *
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
              {t('artisanSignup.password')} *
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
              {t('artisanSignup.confirmPassword')} *
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
              {t('artisanSignup.trade')} *
            </label>
            <input
              type="text"
              name="metier"
              value={formData.metier}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('artisanSignup.city')} *
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('artisanSignup.phone')}
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t('artisanSignup.creating') : t('artisanSignup.create')}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          <Link href="/signup" className="hover:text-gray-900">
            {t('signup.back')}
          </Link>
        </div>
      </div>
    </main>
  )
}
