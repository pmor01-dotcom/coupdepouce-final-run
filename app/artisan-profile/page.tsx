'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import Link from 'next/link'

interface ArtisanProfile {
  id: string
  name: string
  email: string
  phone: string
  location: string
  metier: string
  description?: string
  experience_years?: number
  specialties?: string
}

export default function ArtisanProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useLanguage()

  const [profile, setProfile] = useState<ArtisanProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    metier: '',
    description: '',
    experience_years: '',
    specialties: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/artisan/get-profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          metier: data.metier || '',
          description: data.description || '',
          experience_years: data.experience_years?.toString() || '',
          specialties: data.specialties || ''
        })
      }
    } catch {
      setError(t('errorLoadingProfile'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/artisan/get-profile/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile?.id,
          ...formData,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        fetchProfile()
      } else {
        setError(data.error || t('errorUpdatingProfile'))
      }
    } catch {
      setError(t('connectionError'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>{t('loading')}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-700 to-green-300 py-10 px-4">

      <aside className="fixed top-24 right-4 z-50 flex flex-col gap-3 w-40 sm:w-48">
        <Link href="/artisan-dashboard" className="btn-secondary text-sm w-full text-right">
          {t('backToDashboard')}
        </Link>
      </aside>

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {t('artisanProfileTitle')}
        </h1>

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {t('profileUpdated')}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone')}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('city')}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('trade')}
              </label>
              <input
                type="text"
                value={formData.metier}
                onChange={(e) => handleChange('metier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('experienceYears')}
              </label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => handleChange('experience_years', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                min="0"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              placeholder={t('descriptionPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('specialties')}
            </label>
            <input
              type="text"
              value={formData.specialties}
              onChange={(e) => handleChange('specialties', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              placeholder={t('specialtiesPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {isSaving ? t('saving') : t('saveChanges')}
          </button>

        </form>
      </div>
    </main>
  )
}
