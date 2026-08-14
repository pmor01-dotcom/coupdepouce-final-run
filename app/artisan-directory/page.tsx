'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '../components/LanguageProvider'

interface Artisan {
  id: string
  name: string
  trade: string
  city: string
  experience_years?: number
  specialties?: string
  description?: string
  photo_url?: string
}

export default function ArtisanDirectoryPage() {
  const { t } = useLanguage()
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArtisans()
  }, [])

  const fetchArtisans = async () => {
    try {
      const response = await fetch('/api/public-artisans')
      const data = await response.json()
      setArtisans(data)
    } catch (error) {
      console.error('Error fetching artisans:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>{t('loading')}</p>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {t('artisanDirectory.title') || 'Nos Artisans'}
        </h1>
        <p className="text-center text-gray-700 mb-8">
          {t('artisanDirectory.subtitle') || 'Découvrez nos artisans qualifiés'}
        </p>

        {artisans.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 text-center">
            <p className="text-gray-700">
              {t('artisanDirectory.noArtisans') || 'Aucun artisan disponible pour le moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan) => (
              <div
                key={artisan.id}
                className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  {artisan.photo_url ? (
                    <img
                      src={artisan.photo_url}
                      alt={artisan.name}
                      className="w-20 h-20 rounded-full object-cover mr-4 border-2 border-green-600"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-4 border-2 border-green-600">
                      <span className="text-gray-500 text-2xl">👷</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {artisan.name}
                    </h3>
                    <p className="text-sm text-green-600 font-medium">
                      {artisan.trade}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📍</span>
                    <span>{artisan.city}</span>
                  </div>

                  {artisan.experience_years && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">⏱️</span>
                      <span>{artisan.experience_years} {t('artisanDirectory.years') || 'ans d\'expérience'}</span>
                    </div>
                  )}

                  {artisan.specialties && (
                    <div className="flex items-start text-sm text-gray-600">
                      <span className="mr-2">🔧</span>
                      <span className="line-clamp-2">{artisan.specialties}</span>
                    </div>
                  )}

                  {artisan.description && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {artisan.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
