'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import { MessagingProvider } from '../components/MessagingProvider'
import MessagingInterface from '../components/MessagingInterface'
import MessageNotifications from '../components/MessageNotifications'
import SearchFilters from '../components/SearchFilters'
import SearchResults from '../components/SearchResults'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PaymentStatus from '../components/PaymentStatus'

interface Demand {
  id: number
  title: string
  description: string
  category: string
  location: string
  department: string
  budget: string
  status: string
  createdAt: string
  clientName: string
  hasResponded: boolean
}

interface Proposal {
  id: number
  demandId: number
  demandTitle: string
  message: string
  proposedPrice: string
  status: string
  createdAt: string
}

export default function ArtisanDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'demands' | 'proposals' | 'messages' | 'search'>('demands')
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

  // Helper function to get first name
  const getFirstName = (fullName?: string) => {
    if (!fullName) return ''
    return fullName.split(' ')[0]
  }
  const [demands, setDemands] = useState<Demand[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  useEffect(() => {
    // Mock data for demonstration
    const mockDemands: Demand[] = [
      {
        id: 1,
        title: 'Installation cuisine',
        description: 'Besoin d\'installer un nouveau évier et robinetterie dans la cuisine',
        category: 'Plomberie',
        location: 'Toulouse',
        department: '31',
        budget: '500-800',
        status: 'open',
        createdAt: '2024-01-15',
        clientName: 'Jean Dupont',
        hasResponded: false
      },
      {
        id: 2,
        title: 'Réparation électrique salon',
        description: 'Problème de court-circuit dans le salon, besoin d\'intervention rapide',
        category: 'Électricité',
        location: 'Paris',
        department: '75',
        budget: '300-500',
        status: 'open',
        createdAt: '2024-01-14',
        clientName: 'Marie Martin',
        hasResponded: true
      },
      {
        id: 3,
        title: 'Tonte de pelouse et taille de haies',
        description: 'Jardin de 200m² à entretenir, tonte et taille des haies',
        category: 'Jardinage',
        location: 'Lyon',
        department: '69',
        budget: '150-300',
        status: 'open',
        createdAt: '2024-01-13',
        clientName: 'Pierre Durand',
        hasResponded: false
      }
    ]

    const mockProposals: Proposal[] = [
      {
        id: 1,
        demandId: 1,
        demandTitle: 'Installation cuisine',
        message: 'Je peux réaliser cette installation rapidement. J\'ai 10 ans d\'expérience.',
        proposedPrice: '650',
        status: 'pending',
        createdAt: '2024-01-16'
      }
    ]

    setDemands(mockDemands)
    setProposals(mockProposals)
    setIsLoading(false)
  }, [])

  const handleCreateProposal = (demand: Demand) => {
    window.location.href = `/create-proposal?demand=${demand.id}`
  }

  const loadNotifications = async () => {
    if (!user?.id) return
    setIsNotificationsLoading(true)

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`)
      const data = await response.json()
      if (data.success) {
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setIsNotificationsLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return

    const socket = (window as any).socket
    if (socket) {
      socket.emit('join-user-room', user.id.toString())
    }
    loadNotifications()
  }, [user?.id])

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
      {/* Floating Top Right Buttons */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 50, display: 'flex', gap: '8px' }}>
        <Link href="/artisan-dashboard-inscription-info" className="btn-secondary text-sm">
          Mes informations
        </Link>
        <button
          onClick={handleLogout}
          className="btn-secondary text-sm"
        >
          Déconnexion
        </button>
        <button
          onClick={() => setActiveTab('demands')}
          className="btn-secondary text-sm"
        >
          Demandes disponibles
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className="btn-secondary text-sm"
        >
          Mes propositions
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className="btn-secondary text-sm"
        >
          Messages
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className="btn-secondary text-sm"
        >
          Recherche
        </button>
        <Link href="/artisan-contacts" className="btn-secondary text-sm">
          Mes contacts en cours
        </Link>
        <Link href="/artisan-search-zone" className="btn-secondary text-sm">
          Élargir ma zone de recherche
        </Link>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-3xl font-semibold text-gray-900">
                Espace Artisan
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                {getFirstName(user?.name)} - {user?.metier}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Payment Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <PaymentStatus />
        <div className="mt-4 grid gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notifications du tableau de bord</h2>
                <p className="text-sm text-gray-500">Vous recevez ici les nouvelles demandes publiées dans votre département.</p>
              </div>
              <button
                className="btn-secondary text-sm"
                onClick={loadNotifications}
              >
                Actualiser
              </button>
            </div>
            {isNotificationsLoading ? (
              <p className="text-sm text-gray-600">Chargement des notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-gray-600">Aucune notification pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(notification.created_at).toLocaleString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'demands' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Demandes des clients
            </h2>
            <p className="text-gray-600 mb-6">
              Consultez les demandes des clients et proposez vos services. 
              Les clients pourront ensuite vous contacter directement.
            </p>
            
            <div className="space-y-4">
              {demands.map((demand) => (
                <div key={demand.id} className="card" style={{ maxWidth: '50%', margin: '0 auto' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {demand.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {demand.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        demand.status === 'open'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {demand.status === 'open' ? 'Ouverte' : 'Fermée'}
                      </span>
                      {demand.hasResponded && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Répondu
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 mb-2">
                    <div>
                      <span className="font-medium">Catégorie:</span> {demand.category}
                    </div>
                    <div>
                      <span className="font-medium">Localisation:</span> {demand.location}
                    </div>
                    <div>
                      <span className="font-medium">Département:</span> {demand.department}
                    </div>
                    <div>
                      <span className="font-medium">Budget:</span> {demand.budget}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Client:</span> {demand.clientName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Publiée le {demand.createdAt}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCreateProposal(demand)}
                      disabled={demand.hasResponded || demand.status !== 'open'}
                      className="btn-success disabled:opacity-50 disabled:cursor-not-allowed text-xs px-2 py-1"
                    >
                      {demand.hasResponded 
                        ? 'Déjà répondu' 
                        : demand.status !== 'open'
                        ? 'Demande fermée'
                        : 'Proposer'
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'proposals' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mes propositions
            </h2>
            {proposals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Vous n'avez pas encore fait de propositions
                </p>
                <button
                  onClick={() => setActiveTab('demands')}
                  className="btn-success"
                >
                  Voir les demandes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {proposal.demandTitle}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {proposal.message}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Prix proposé: {proposal.proposedPrice}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      proposal.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : proposal.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {proposal.status === 'PENDING'
                        ? 'En attente'
                        : proposal.status === 'ACCEPTED'
                        ? 'Acceptée'
                        : 'Refusée'}
                    </span>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        En attente de réponse du client
                      </p>
                      <Link href={`/proposals/${proposal.id}`} className="btn-secondary">
                        Voir les détails
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recherche de demandes
            </h2>
            <div className="space-y-6">
              <SearchFilters
                type="demands"
                onFiltersChange={setSearchFilters}
                onSearch={setSearchQuery}
              />
              <SearchResults
                type="demands"
                query={searchQuery}
                filters={searchFilters}
              />
            </div>
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
