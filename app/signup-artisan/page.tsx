'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'
import { createClient } from '@supabase/supabase-js'

export default function ArtisanSignupPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("SUPABASE KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    city: '',
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
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: 'artisan',
            department: formData.department,
            city: formData.city,
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

      const { error: profileError } = await supabase.from('artisans').insert({
        id: user.id,
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        department: formData.department,
        city: formData.city,
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
// Success → send user to check email page
      router.push('/check-email')
      
    } catch (err: any) {
      setError(err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-green-700 to-green-200">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md space-y-6">

        <h2 className="text-3xl font-bold text-center text-gray-900">
          {t('artisanSignup.title')}
        </h2>

        <p className="text-center text-gray-600">
          {t('artisanSignup.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.firstName')} *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
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


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.department')} *
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.city')} *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
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
            {loading ? t('artisanSignup.creating') : t('artisanSignup.submit')}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            {t('app.back')}
          </Link>
        </div>
      </div>
    </main>
  )
}
