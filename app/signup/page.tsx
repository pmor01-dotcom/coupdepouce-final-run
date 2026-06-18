'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'
import { createClient } from '@supabase/supabase-js'

export default function SignupPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [role, setRole] = useState<'client' | 'artisan' | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRoleSelection = (selected: 'client' | 'artisan') => {
    setRole(selected)
    setError('')

    if (selected === 'artisan') {
      router.push('/signup-artisan')
    }
  }

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

    if (formData.password !== formData.confirmPassword) {
      setError(t('signup.passwordMismatch'))
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'client',
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      const user = data.user
      if (!user) {
        setError(t('signup.signupError'))
        setLoading(false)
        return
      }

      const { error: profileError } = await supabase.from('clients').insert({
        id: user.id,
        name: formData.name,
        email: formData.email,
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      router.push('/client-dashboard')
    } catch (err: any) {
      setError(err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-green-700 to-green-200">
      <div className="max-w-md w-full space-y-8">

        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {t('signup.title')}
          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">
            {t('signup.alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              {t('signup.goToLogin')}
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('signup.subtitle')}
          </label>

          <div className="space-y-3 mb-6">

            {/* CLIENT */}
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

            {/* ARTISAN */}
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

          {/* CLIENT FORM */}
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

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? t('common.loading') : t('signup.continue')}
              </button>
            </form>
          )}

          {!role && (
            <p className="text-center text-gray-500">
              {t('signup.selectRole')}
            </p>
          )}
        </div>

        <div className="text-center text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            {t('app.back')}
          </Link>
        </div>
      </div>
    </main>
  )
}
