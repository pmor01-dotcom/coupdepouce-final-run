'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useLanguage } from '../components/LanguageProvider'
import { MessagingProvider } from '../components/MessagingProvider'
import MessagingInterface from '../components/MessagingInterface'
import MessageNotifications from '../components/MessageNotifications'
import SearchFilters from '../components/SearchFilters'
import SearchResults from '../components/SearchResults'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ArtisanDashboard() {
  const supabase = createClientComponentClient()
  const { t } = useLanguage()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'demands' | 'messages' | 'search'>('demands')

  const [openDemands, setOpenDemands] = useState<any[]>([])
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

  // Load auth user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()
  }, [])

  // Load artisan profile + open demands
  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        // Load artisan profile
        const { data: artisanProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(artisanProfile)

        // Load OPEN demands in same departement
        if (artisanProfile?.departement) {
          const { data: demandsData } = await supabase
            .from('demands')
            .select('*')
            .eq('status', 'OPEN')
            .eq('departement', artisanProfile.departement)
            .order('created_at', { ascending: false })

          setOpenDemands(demandsData || [])
        }

      } catch (err) {
        console.error('Error loading artisan dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getFirstName = () => profile?.firstname || ''

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Chargement...</p>
      </main>
    )
  }

  return (
    <MessagingProvider>
      <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
        
        {/* HEADER */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-semibold text-gray-900">
                {t('createDemand.welcome')}, {getFirstName()}
              </h1>

              <button onClick={logout} className="btn-secondary">
                {t('dashboard.logout')}
              </button>
            </div>
          </div>
        </header>

        {/* TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveTab('demands')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'demands' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Demandes ouvertes
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'messages' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t('clientDashboard.messages')}
              </button>

              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'search' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {t('clientDashboard.search')}
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* OPEN DEMANDS */}
          {activeTab === 'demands' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Demandes ouvertes dans votre département
              </h2>

              {openDemands.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Aucune demande ouverte actuellement dans votre département.
                  </p>
                </div>
              )}

              {openDemands.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {openDemands.map((demand) => (
                    <div key={demand.id} className="card p-4">

                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{demand.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                            {demand.description}
                          </p>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Ouverte
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div><span className="font-medium">Catégorie:</span> {demand.category || '—'}</div>
                        <div><span className="font-medium">Localisation:</span> {demand.location || '—'}</div>
                        <div><span className="font-medium">Budget:</span> {demand.budget_range || 'Non spécifié'}</div>
                        <div><span className="font-medium">Département:</span> {demand.departement || '—'}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Créée le {new Date(demand.created_at).toLocaleDateString('fr-FR')}
                        </span>

                        <div className="flex space-x-2">
                          <Link href={`/demands/${demand.id}`} className="btn-secondary">
                            Voir la demande
                          </Link>
                          <Link href={`/demands/${demand.id}/propose`} className="btn-primary">
                            Envoyer une proposition
                          </Link>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MESSAGES */}
          {activeTab === 'messages' && (
            <div className="h-96">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
              <MessagingInterface />
            </div>
          )}

          {/* SEARCH */}
          {activeTab === 'search' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recherche avancée</h2>
              <div className="space-y-6">
                <SearchFilters type="artisans" onFiltersChange={setSearchFilters} onSearch={setSearchQuery} />
                <SearchResults type="artisans" query={searchQuery} filters={searchFilters} />
              </div>
            </div>
          )}

        </div>
      </main>

      <MessageNotifications />
    </MessagingProvider>
  )
}
