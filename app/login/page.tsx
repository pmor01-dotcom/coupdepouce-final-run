'use client'

import { useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Login() {
  const { t } = useLanguage()
  const supabase = createClientComponentClient()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(formData.email, formData.password)

      if (success) {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user?.id) {
          setError('Unable to load your session')
          return
        }

        const userId = session.user.id

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()

        if (!profile) {
          setError('Unable to load your profile')
          return
        }

        const role = profile.role

        if (role === 'client') window.location.href = '/client-dashboard'
        else if (role === 'artisan') window.location.href = '/artisan-dashboard'
        else setError('Your account has no role assigned')

      } else {
        setError('Incorrect email or password')
      }
    } catch {
      setError('Error during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      <div className="container mx-auto px-4 py-16">

        {/* Top Image Section */}
        <div className="flex justify-center gap-8 mb-12">

          {/* Artisans */}
          <div className="w-1/4 bg-white rounded-lg shadow-lg p-4">
            <img 
              src="/images/artisan-photo-right.jpg"
              alt="Professional artisans working"
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            <h2 className="text-lg font-semibold mb-2">{t('home.qualifiedArtisans')}</h2>
            <p className="text-gray-700 text-sm">
              {t('home.qualifiedArtisansDesc')}
            </p>
          </div>

          {/* Clients */}
          <div className="w-1/4 bg-white rounded-lg shadow-lg p-4">
            <img 
              src="/images/satisfied-clients.jpg"
              alt="Happy clients receiving help"
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            <h2 className="text-lg font-semibold mb-2">{t('home.satisfiedClients')}</h2>
            <p className="text-gray-700 text-sm">
              {t('home.satisfiedClientsDesc')}
            </p>
          </div>

        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">{t('login.title')}</h1>

          {error && (
            <p className="text-red-600 text-center mb-4">{error}</p>
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

          <div className="text-center mt-6">
            <Link href="/forgot-password" className="text-green-700 hover:underline">
              {t('signup.forgotPassword')}
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
