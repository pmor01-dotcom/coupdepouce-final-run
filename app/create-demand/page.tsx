'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function CreateDemandPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const { user, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    department: '',
    category: '',
    budget_range: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log("User object:", user)

    if (!user || !user.email) {
      setError('User not authenticated. Please login again.')
      setLoading(false)
      return
    }

    console.log("Submitting demand for user:", user.email, "ID:", user.id)

    try {
      const res = await fetch('/api/demands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.city,
          department: formData.department,
          budget_range: formData.budget_range,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || t('error'))
        setLoading(false)
        return
      }

      router.push('/client-dashboard')
    } catch (err: any) {
      setError(err.message || t('error'))
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">{t('loading')}</p>
      </main>
    )
  }

  if (!user) {
    router.push('/client-dashboard')
    return null
  }

  // Check if user is a client
  if (user.role !== 'client') {
    router.push(user.role === 'artisan' ? '/artisan-dashboard' : '/client-dashboard')
    return null
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-700 to-green-200 px-4 py-12">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md space-y-6">

        <h2 className="text-3xl font-bold text-center text-gray-900">
          {t('createDemand.title')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.title')} *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.description')} *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field h-28"
              required
            />
          </div>

          {/* City */}
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

          {/* Department */}
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

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.category')} *
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
              placeholder={t('form.categoryPlaceholder')}
            />
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.budget')} *
            </label>
            <input
              type="text"
              name="budget_range"
              value={formData.budget_range}
              onChange={handleChange}
              className="input-field"
              required
              placeholder={t('form.budgetPlaceholder')}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t('loading') : t('form.createDemand')}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          <button
            onClick={() => router.push('/client-dashboard')}
            className="hover:text-gray-900"
          >
            {t('form.back')}
          </button>
        </div>
      </div>
    </main>
  )
}
