'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function CreateDemandPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user } = useAuth()
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    department: '',
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

    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase.from('demands').insert({
        client_id: user.id,
        title: formData.title,
        description: formData.description,
        city: formData.city,
        department: formData.department,
        status: 'open',
      })

      if (insertError) {
        setError(insertError.message)
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

  // If not authenticated, send to login
  if (!user) {
    router.push('/login')
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
              Title *
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
              Description *
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

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t('common.loading') : 'Create demand'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          <button
            onClick={() => router.push('/client-dashboard')}
            className="hover:text-gray-900"
          >
            {t('app.back')}
          </button>
        </div>
      </div>
    </main>
  )
}
