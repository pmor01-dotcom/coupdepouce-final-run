'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function ArtisanListPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()
  const { user, isLoading: authLoading } = useAuth()
  const { t } = useLanguage()

  const [artisans, setArtisans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    const loadArtisans = async () => {
      const { data, error } = await supabase
        .from('artisans')
        .select('*')
        .order('first_name', { ascending: true })

      if (!error) setArtisans(data || [])
      setLoading(false)
    }

    loadArtisans()
  }, [user, authLoading, supabase, router])

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">{t('common.loading')}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.artisans.title')}
          </h1>

          <button
            onClick={() => router.push('/client-dashboard')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            {t('app.back')}
          </button>
        </div>

        {/* No artisans */}
        {artisans.length === 0 && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-600">{t('dashboard.noArtisans')}</p>
          </div>
        )}

        {/* Artisan list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {artisans.map(artisan => (
            <div
              key={artisan.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {artisan.first_name} {artisan.last_name}
              </h2>

              <p className="text-gray-700 mt-1">
                <strong>Métier:</strong> {artisan.metier}
              </p>

              <p className="text-gray-700">
                <strong>{t('form.city')}:</strong> {artisan.city}
              </p>

              <p className="text-gray-700">
                <strong>{t('form.department')}:</strong> {artisan.department}
              </p>

              <button
                onClick={() => router.push(`/messages?artisan=${artisan.id}`)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                {t('dashboard.contactArtisan')}
              </button>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
