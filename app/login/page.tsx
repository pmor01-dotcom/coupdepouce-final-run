'use client'

import { useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'

export default function Login() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(formData.email, formData.password)

      if (success) {
        // Wait for auth state to update, then redirect based on actual user role
        setTimeout(() => {
          if (user?.role === 'client') {
            window.location.href = '/client-dashboard'
          } else if (user?.role === 'artisan') {
            window.location.href = '/artisan-dashboard'
          } else {
            // Fallback to client dashboard if role is not set
            window.location.href = '/client-dashboard'
          }
        }, 200)
      } else {
        setError('Email ou mot de passe incorrect')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Erreur lors de la connexion')
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      <div className="container mx-auto px-4 py-16">
        {/* Top Image Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Left Image */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <img 
              src="/artisan-photo.jpg" 
              alt="Professional artisans working"
              className="w-full h-32 object-cover rounded-lg mb-4"
              style={{ maxHeight: '128px', objectFit: 'cover' }}
              onError={(e) => {
                console.error('Image failed to load:', e);
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Artisan+Image';
              }}
              onLoad={() => console.log('Artisan image loaded successfully')}
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('home.qualifiedArtisans')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('home.qualifiedArtisansDesc')}
            </p>
          </div>
          
          {/* Right Image */}
          <div className="bg-white rounded-lg shadow-lg p-6 ml-48">
            <img 
              src="/images/satisfied-clients.jpg" 
              alt="Happy clients with completed projects"
              className="w-full h-32 object-cover rounded-lg mb-4"
              style={{ maxHeight: '128px', objectFit: 'cover' }}
              onError={(e) => {
                console.error('Image failed to load:', e);
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Client+Image';
              }}
              onLoad={() => console.log('Client image loaded successfully')}
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('home.satisfiedClients')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('home.satisfiedClientsDesc')}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('login.noAccount')}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              {t('login.signup')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('login.email')}
              </label>
              <input
                id="email"
                placeholder="••••••••••"
                type="email"
                required
                className="input-field mt-1"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('login.exampleEmail')}
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field mt-1"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('common.loading') : t('login.button')}
            </button>
          </div>

          <div className="text-center">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              Mot de passe oublié ?
            </Link>
          </div>
        </form>
      </div>
        </div>
      </div>
    </main>
  )
}
