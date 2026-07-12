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

        // Get role from users table
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single()

        if (!profile) {
          setError('Unable to load your profile')
          return
        }

        const role = profile.role?.toLowerCase() // Convert CLIENT/ARTISAN to lowercase

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
        <section className="hero-grid grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 px-2">

          {/* Artisans */}
          <article className="hero-card bg-white rounded-lg shadow overflow-hidden mx-auto w-full">
            <img
              src="/images/artisan-photo-right.jpg"
              alt="Professional artisans working"
              className="hero-card-image w-full h-20 md:h-24 object-cover"
              loading="lazy"
            />
            <div className="hero-card-content p-2 text-center md:text-left">
              <h3 className="text-xs md:text-sm font-semibold mb-1">{t('home.qualifiedArtisans')}</h3>
            </div>
          </article>

          {/* Clients */}
          <article className="hero-card bg-white rounded-lg shadow overflow-hidden mx-auto w-full">
            <img
              src="/images/satisfied-clients.jpg"
              alt="Happy clients receiving help"
              className="hero-card-image w-full h-20 md:h-24 object-cover"
              loading="lazy"
            />
            <div className="hero-card-content p-2 text-center md:text-left">
              <h3 className="text-xs md:text-sm font-semibold mb-1">{t('home.satisfiedClients')}</h3>
            </div>
          </article>

        </section>

        {/* Login Form */}
        <div className="max-w-md mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t('login.title')}</h1>

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