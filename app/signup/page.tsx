'use client'

import { useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../components/LanguageProvider'

export default function Signup() {
  const { t } = useLanguage()
  const [role, setRole] = useState<'client' | 'artisan' | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (role === 'artisan' && !termsAccepted) {
      setError('Vous devez accepter les conditions générales')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'client'
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'inscription')
      }

      // 🔥 FIXED: login() requires arguments — now correctly called
      const loginSuccess = await login(
        formData.email,
        formData.password,
        'client',
        formData.name
      )

      if (loginSuccess) {
        await new Promise(resolve => setTimeout(resolve, 100))
        window.location.href = '/client-dashboard'
      } else {
        setError(t('common.error'))
      }
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelection = (selectedRole: 'client' | 'artisan') => {
    setRole(selectedRole)
    setError('')

    if (selectedRole === 'artisan') {
      router.push('/signup-artisan')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-700 to-green-200">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('signup.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('login.subtitle')}{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              {t('login.signup')}
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('signup.subtitle')}
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={role === 'client'}
                  onChange={() => handleRoleSelection('client')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">{t('signup.client')}</span>
                  <p className="text-sm text-gray-600">{t('signup.client.desc')}</p>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value="artisan"
                  checked={role === 'artisan'}
                  onChange={() => handleRoleSelection('artisan')}
                  className="mr-3"
                />
                <div>
                  <span className="font-medium">{t('signup.artisan')}</span>
                  <p className="text-sm text-gray-600">{t('signup.artisan.desc')}</p>
                </div>
              </label>
            </div>
          </div>

          {/* Client Signup Form */}
          {role === 'client' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.firstName')} *
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
                  {t('login.email')} *
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
                  {t('login.password')} *
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
                  {t('signup.confirmPassword')} *
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

              <div className="text-right text-sm">
                <Link href="/reset-password" className="text-blue-600 hover:text-blue-500">
                  {t('signup.forgotPassword')}
                </Link>
              </div>

              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
