'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import { MessagingProvider, useMessaging } from '../components/MessagingProvider'
import MessagingInterface from '../components/MessagingInterface'
import MessageNotifications from '../components/MessageNotifications'
import SearchFilters from '../components/SearchFilters'
import SearchResults from '../components/SearchResults'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getArtisansByDepartment, searchArtisans, Artisan as ArtisanService } from '../services/artisanService'

interface Demand {
  id: number
  title: string
  description: string
  category: string
  location: string
  department: string
  budget_range: string
  urgency: string
  status: string
  created_at: string
  client_id: number
  proposals: any[]
}

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  // Helper function to get first name
  const getFirstName = (fullName?: string) => {
    if (!fullName) return ''
    return fullName.split(' ')[0]
  }

  // Helper function to get demand status text
  const getDemandStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Ouverte'
      case 'IN_PROGRESS':
        return 'En cours'
      case 'COMPLETED':
        return 'Terminée'
      default:
        return 'Inconnue'
    }
  }
  const [activeTab, setActiveTab] = useState<'artisans' | 'demands' | 'messages' | 'search'>('artisans')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    department: '',
    location: '',
    minExperience: '',
    maxExperience: '',
    hasInsurance: '',
    isAvailable: '',
    minRating: '',
    budgetRange: '',
    urgency: '',
    status: '',
    minBudget: '',
    maxBudget: '',
    hasProposals: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  const [artisans, setArtisans] = useState<ArtisanService[]>([])
  const [demands, setDemands] = useState<Demand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showArtisansList, setShowArtisansList] = useState(false)
  const [clientDepartment, setClientDepartment] = useState<string>('31 - Haute-Garonne') // Default department

  const handleContactArtisan = (artisan: ArtisanService) => {
    // Show contact options for this artisan
    const isEnglish = localStorage.getItem('language') === 'en'
    const contactInfo = isEnglish 
      ? `Contact options for ${artisan.name}:\n\n• Phone: ${artisan.phone}\n• Email: ${artisan.email}\n• Location: ${artisan.city}\n• Availability: ${artisan.availability}\n• Response Time: ${artisan.responseTime}\n• Hourly Rate: ${artisan.hourlyRate}€/h\n• Experience: ${artisan.experience} years`
      : `Options pour contacter ${artisan.name}:\n\n• Téléphone: ${artisan.phone}\n• Email: ${artisan.email}\n• Localisation: ${artisan.city}\n• Disponibilité: ${artisan.availability}\n• Temps de réponse: ${artisan.responseTime}\n• Tarif horaire: ${artisan.hourlyRate}€/h\n• Expérience: ${artisan.experience} ans`
    
    alert(contactInfo)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's demands from database
        if (user) {
          const demandsResponse = await fetch(`/api/demands?clientId=${user.id}`)
          if (demandsResponse.ok) {
            const userDemands = await demandsResponse.json()
            setDemands(userDemands)
          }

          // Fetch artisans in client's department automatically
          const availableArtisans = getArtisansByDepartment(clientDepartment)
          setArtisans(availableArtisans)
          
          // Auto-show artisans list when artisans are available
          if (availableArtisans.length > 0) {
            setShowArtisansList(true)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, clientDepartment])

  // Handle query parameters for tab switching and refresh
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    const refresh = urlParams.get('refresh')
    
    if (tab === 'demands') {
      setActiveTab('demands')
    }
    
    if (refresh === 'true') {
      // Refresh data when coming from create-demand page
      const refreshData = async () => {
        if (user) {
          const demandsResponse = await fetch(`/api/demands?clientId=${user.id}`)
          if (demandsResponse.ok) {
            const userDemands = await demandsResponse.json()
            setDemands(userDemands)
          }
        }
      }
      refreshData()
      // Clean up URL
      window.history.replaceState({}, '', '/client-dashboard')
    }
  }, [user])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Chargement...</p>
        </div>
      </main>
    )
  }

  return (
    <MessagingProvider>
      <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {t('createDemand.welcome')}, {getFirstName(user?.name)}
              </h1>
            </div>
            <div className="flex items-center space-x-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
              <Link href="/create-demand" className="btn-primary text-sm px-4 py-2">
                {t('createDemand.title')}
              </Link>
              <button
                onClick={logout}
                className="btn-secondary"
              >
                {t('dashboard.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('artisans')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'artisans'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('clientDashboard.artisans')}
            </button>
            <button
              onClick={() => setActiveTab('demands')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'demands'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('clientDashboard.myDemands')}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'messages'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('clientDashboard.messages')}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('clientDashboard.search')}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showArtisansList && activeTab === 'artisans' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Artisans Section - Left Side */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('dashboard.artisans.title')} ({artisans.length})
              </h2>
              {artisans.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    {t('dashboard.noArtisans')}
                  </p>
                  <Link href="/create-demand" className="btn-primary">
                    {t('createDemand.title')}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artisans.map((artisan) => (
                    <div key={artisan.id} className="card p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {artisan.name}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {artisan.type === 'artisan' ? t('signup.artisan') : 'Handyman'} • {artisan.specialty.join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-yellow-400 text-sm">{'\u2605'}</span>
                          <span className="ml-1 text-xs text-gray-600">
                            {artisan.rating}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">{t('form.city')}:</span> {artisan.city}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">{t('form.department')}:</span> {artisan.department}
                        </p>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">{t('payment.hourlyRate')}:</span> {artisan.hourlyRate}€/h
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            artisan.availability === 'Immédiate' || artisan.availability === 'Immediate'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {artisan.availability}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {artisan.responseRate}% {t('dashboard.responseRate')}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-700 line-clamp-2">
                          {artisan.description[t('language') === 'en' ? 'en' : 'fr']}
                        </p>
                      </div>

                      <button
                        onClick={() => handleContactArtisan(artisan)}
                        className="w-full btn-primary text-sm py-2"
                      >
                        {t('dashboard.contactArtisan')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Tab Content */}
        {activeTab === 'messages' && (
          <div className="h-96">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Messages
            </h2>
            <div className="h-full">
              <MessagingInterface />
            </div>
          </div>
        )}

        {/* Search Tab Content */}
        {activeTab === 'search' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recherche avancée
            </h2>
            <div className="space-y-6">
              <SearchFilters
                type="artisans"
                onFiltersChange={setSearchFilters}
                onSearch={setSearchQuery}
              />
              <SearchResults
                type="artisans"
                query={searchQuery}
                filters={searchFilters}
              />
            </div>
          </div>
        )}

        {/* Demands Tab Content */}
        {activeTab === 'demands' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mes demandes
            </h2>
            {demands.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Vous n'avez pas encore de demandes
                </p>
                <Link href="/create-demand" className="btn-primary">
                  Créer une demande
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demands.map((demand) => (
                  <div key={demand.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {demand.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {demand.description}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      demand.status === 'OPEN'
                        ? 'bg-yellow-100 text-yellow-800'
                        : demand.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                        {getDemandStatusText(demand.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Catégorie:</span> {demand.category}
                      </div>
                      <div>
                        <span className="font-medium">Localisation:</span> {demand.location}
                      </div>
                      <div>
                        <span className="font-medium">Budget:</span> {demand.budget_range || 'Non spécifié'}
                      </div>
                      <div>
                        <span className="font-medium">Réponses:</span> {demand.proposals?.length || 0}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Créée le {new Date(demand.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      <div className="flex space-x-2">
                        {demand.proposals && demand.proposals.length > 0 && (
                          <Link href={`/demands/${demand.id}`} className="btn-secondary">
                            Voir les propositions ({demand.proposals.length})
                          </Link>
                        )}
                        <Link href={`/demands/${demand.id}`} className="btn-primary">
                          Voir les détails
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Unsubscribe Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            if (confirm(t('unsubscribe.confirm'))) {
              // Handle unsubscribe logic here
              logout()
              router.push('/')
            }
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-colors duration-200"
          title={t('unsubscribe.title')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-sm font-medium">{t('unsubscribe.title')}</span>
        </button>
      </div>
    </main>
      <MessageNotifications />
    </MessagingProvider>
  )
}
