'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from './LanguageProvider'
import { useRouter } from 'next/navigation'

interface Demand {
  id: string | number
  title: string
  category: string
  location: string
  description?: string
  budget_range?: string
  urgency?: string
  client_id: number
  users?: {
    email?: string
    name?: string
    phone?: string
  }
}

export default function DemandCarousel() {
  const { t } = useLanguage()
  const router = useRouter()
  const [demands, setDemands] = useState<Demand[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDemands()
  }, [])

  const fetchDemands = async () => {
    try {
      const response = await fetch('/api/public-demands')
      const data = await response.json()
      
      console.log('Fetched demands data:', data)
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setDemands(data)
      } else {
        console.error('Invalid data format received:', data)
        setDemands([])
      }
    } catch (error) {
      console.error('Error fetching demands:', error)
      setDemands([])
    } finally {
      setLoading(false)
    }
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const handleContactClient = (demand: Demand) => {
    console.log('Contact clicked, demand ID:', demand.id, 'Type:', typeof demand.id)
    // Navigate to create-proposal page with demand ID as query parameter
    router.push(`/create-proposal?demand=${demand.id}`)
  }

  const handleViewDetails = (demand: Demand) => {
    setSelectedDemand(demand)
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'VERY_URGENT':
        return 'bg-red-200 text-red-900'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  if (loading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <p className="text-center text-gray-600">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('artisanDashboard.availableDemands') || 'Demandes disponibles'}
          </h3>
          
          <div className="flex items-center gap-3 hidden md:flex">
            <button
              onClick={scrollLeft}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollBehavior: 'smooth' }}
            >
              {demands.map((demand) => (
                <div
                  key={demand.id}
                  onClick={() => handleViewDetails(demand)}
                  className="flex-shrink-0 bg-white cursor-pointer hover:shadow-xl transition-all"
                  style={{
                    width: '320px',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '2px solid #9ca3af'
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {demand.title}
                    </h4>
                    {demand.urgency && demand.urgency !== 'NORMAL' && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(demand.urgency)}`}>
                        {demand.urgency}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{demand.category}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    📍 {demand.location}
                  </p>
                  {demand.budget_range && (
                    <p className="text-xs text-green-600 font-medium">
                      💰 {demand.budget_range}
                    </p>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleContactClient(demand)
                    }}
                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white transition-colors font-medium"
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      fontSize: '14px'
                    }}
                  >
                    {t('contact') || 'Contacter'}
                  </button>
                </div>
              ))}
              
              {demands.length === 0 && (
                <p className="text-gray-500 text-sm">
                  {t('artisanDashboard.noDemands') || 'Aucune demande disponible'}
                </p>
              )}
            </div>
            
            <button
              onClick={scrollRight}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Mobile vertical stack */}
          <div className="flex flex-col gap-4 md:hidden max-h-[60vh] overflow-y-auto">
            {demands.map((demand) => (
              <div
                key={demand.id}
                onClick={() => handleViewDetails(demand)}
                className="bg-white cursor-pointer hover:shadow-xl transition-all"
                style={{
                  borderRadius: '16px',
                  padding: '20px',
                  border: '2px solid #9ca3af'
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {demand.title}
                  </h4>
                  {demand.urgency && demand.urgency !== 'NORMAL' && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(demand.urgency)}`}>
                      {demand.urgency}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mb-2">{demand.category}</p>
                <p className="text-xs text-gray-500 mb-2">
                  📍 {demand.location}
                </p>
                {demand.budget_range && (
                  <p className="text-xs text-green-600 font-medium">
                    💰 {demand.budget_range}
                  </p>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleContactClient(demand)
                  }}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white transition-colors font-medium"
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                >
                  {t('contact') || 'Contacter'}
                </button>
              </div>
            ))}
            
            {demands.length === 0 && (
              <p className="text-gray-500 text-sm">
                {t('artisanDashboard.noDemands') || 'Aucune demande disponible'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Demand Details Modal */}
      {selectedDemand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedDemand.title}
                </h2>
                <button
                  onClick={() => setSelectedDemand(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">{t('category') || 'Catégorie'}:</span>
                    <p className="text-gray-900">{selectedDemand.category}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">{t('location') || 'Localisation'}:</span>
                    <p className="text-gray-900">{selectedDemand.location}</p>
                  </div>
                </div>

                {selectedDemand.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">{t('description') || 'Description'}:</span>
                    <p className="text-gray-900">{selectedDemand.description}</p>
                  </div>
                )}

                {selectedDemand.budget_range && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">{t('budget') || 'Budget'}:</span>
                    <p className="text-gray-900 font-semibold text-green-600">{selectedDemand.budget_range}</p>
                  </div>
                )}

                {selectedDemand.urgency && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">{t('urgency') || 'Urgence'}:</span>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(selectedDemand.urgency)}`}>
                      {selectedDemand.urgency}
                    </span>
                  </div>
                )}

                {selectedDemand.users && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {t('clientInfo') || 'Informations client'}
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">{t('name') || 'Nom'}:</span> {selectedDemand.users.name}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">{t('email') || 'Email'}:</span> {selectedDemand.users.email}
                      </p>
                      {selectedDemand.users.phone && (
                        <p className="text-sm">
                          <span className="font-medium">{t('phone') || 'Téléphone'}:</span> {selectedDemand.users.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setSelectedDemand(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('close') || 'Fermer'}
                </button>
                <button
                  onClick={() => handleContactClient(selectedDemand)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  {t('contact') || 'Contacter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
