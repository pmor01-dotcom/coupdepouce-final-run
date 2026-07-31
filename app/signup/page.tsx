'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'

type SignupRole = null | 'client' | 'artisan'

export default function SignupPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [selectedRole, setSelectedRole] = useState<SignupRole>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    ville: '',
    metier: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // ⭐ FIX: Prevent submitting without selecting a role
    if (!selectedRole) {
      setError("Veuillez choisir un rôle avant de continuer.")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('signup.passwordMismatch'))
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: selectedRole,
          ville: formData.ville || null,
          metier: selectedRole === 'artisan' ? formData.metier : null,
          phone: formData.phone || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('signup.signupError'))
        setLoading(false)
        return
      }

      if (data.needsEmailVerification) {
        router.push('/check-email')
      } else {
        router.push(selectedRole === 'client' ? '/client-dashboard' : '/artisan-dashboard')
      }
    } catch (err: any) {
      setError(err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  // Show role selection
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-700 to-green-300 px-4">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            {t('signup.title')}
          </h1>
          <p className="text-gray-600 text-center mb-8">
            {t('signup.subtitle')}
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setSelectedRole('client')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('signup.client')}</h3>
                  <p className="text-sm text-gray-600">{t('signup.client.desc')}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole('artisan')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('signup.artisan')}</h3>
                  <p className="text-sm text-gray-600">{t('signup.artisan.desc')}</p>
                </div>
              </div>
            </button>
          </div>

          <p className="text-center text-gray-600 mt-8">
            {t('signup.alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
              {t('signup.goToLogin')}
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Show signup form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-700 to-green-300 px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full mx-4">
        <button
          onClick={() => setSelectedRole(null)}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('signup.back')}
        </button>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
          {selectedRole === 'client' ? t('clientSignup.title') : t('artisanSignup.title')}
        </h1>
        {selectedRole === 'artisan' && (
          <p className="text-gray-600 text-center mb-6">
            {t('artisanSignup.subtitle')}
          </p>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {selectedRole === 'client' ? t('clientSignup.firstName') : t('artisanSignup.fullName')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clientSignup.email')} *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clientSignup.password')} *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clientSignup.confirmPassword')} *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('clientSignup.city')} *
            </label>
            <input
              type="text"
              value={formData.ville}
              onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {selectedRole === 'artisan' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('artisanSignup.trade')} *
                </label>
                <select
                  value={formData.metier}
                  onChange={(e) => setFormData({ ...formData, metier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">{t('work.select')}</option>
                  <option value="Plombier">{t('work.plumber')}</option>
                  <option value="Électricien">{t('work.electrician')}</option>
                  <option value="Menuisier">{t('work.carpenter')}</option>
                  <option value="Peintre">{t('work.painter')}</option>
                  <option value="Maçon">{t('work.mason')}</option>
                  <option value="Couvreur">{t('work.roofer')}</option>
                  <option value="Serrurier">{t('work.locksmith')}</option>
                  <option value="Chauffagiste">{t('work.heating')}</option>
                  <option value="Plâtrier">{t('work.plasterer')}</option>
                  <option value="Carreleur">{t('work.tiler')}</option>
                  <option value="Location d'outils">{t('work.toolRental')}</option>
                  <option value="Garde d'enfants">{t('work.babysitting')}</option>
                  <option value="Jardinage">{t('work.gardening')}</option>
                  <option value="Courses">{t('work.shopping')}</option>
                  <option value="Autre">{t('work.other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('artisanSignup.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('clientSignup.creating') : t('clientSignup.create')}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          {t('signup.alreadyHaveAccount')}{' '}
          <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
            {t('signup.goToLogin')}
          </Link>
        </p>
      </div>
    </div>
  )
}
