'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import { MessagingProvider, useMessaging } from '../components/MessagingProvider'
import MessagingInterface from '../components/MessagingInterface'
import MessageNotifications from '../components/MessageNotifications'
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
  budget_range: string
  status: string
  urgency: string
  created_at: string
}

interface Proposal {
  id: number
  demand_id: number
  message: string
  proposed_price: string
  estimated_duration?: string
  availability?: string
  status: string
  created_at: string
  artisan?: {
    id: number
    name: string
    metier: string
    location: string
    phone: string
  }
}

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'demands' | 'proposals' | 'messages'>('demands')
  const [demands, setDemands] = useState<Demand[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Helper function to get first name
  const getFirstName = (fullName?: string) => {
    if (!fullName) return ''
    return fullName.split(' ')[0]
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  useEffect(() => {
    fetchDemands()
  }, [])

  const fetchDemands = async () => {
    try {
      const response = await fetch('/api/demands')
      if (response.ok) {
        const data = await response.json()
        setDemands(data)
      }
    } catch (error) {
      console.error('Error fetching demands:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProposals = async (demandId: number) => {
    try {
      const response = await fetch(`/api/proposals?demandId=${demandId}`)
      if (response.ok) {
        const data = await response.json()
        setProposals(data)
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    }
  }

  const handleViewProposals = (demandId: number) => {
    fetchProposals(demandId)
    setActiveTab('proposals')
  }

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
            Mes demandes
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className="btn-secondary text-sm"
          >
            Propositions reçues
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className="btn-secondary text-sm"
          >
            Messages
          </button>
          <Link href="/create-demand" className="btn-secondary text-sm">
            Créer une demande
          </Link>
        </div>

        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-3xl font-semibold text-gray-900">
                  Espace Client
                </h1>
                <span className="ml-2 text-sm text-gray-500">
                  {getFirstName(user?.name)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Payment Status */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <PaymentStatus />
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'demands' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Mes demandes
              </h2>
              <p className="text-gray-600 mb-6">
                Gérez vos demandes de services et consultez les propositions des artisans.
              </p>

              {demands.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    Vous n'avez pas encore créé de demandes
                  </p>
                  <Link href="/create-demand" className="btn-success">
                    Créer une demande
                  </Link>
                </div>
              ) : (
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
                            demand.status === 'OPEN'
                              ? 'bg-green-100 text-green-800'
                              : demand.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : demand.status === 'COMPLETED'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {demand.status === 'OPEN' ? 'Ouverte' : 
                             demand.status === 'IN_PROGRESS' ? 'En cours' :
                             demand.status === 'COMPLETED' ? 'Terminée' : 'Annulée'}
                          </span>
                          {demand.urgency === 'URGENT' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Urgent
                            </span>
                          )}
                          {demand.urgency === 'VERY_URGENT' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Très urgent
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
                          <span className="font-medium">Budget:</span> {demand.budget_range || 'Non spécifié'}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          Publiée le {new Date(demand.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        <button
                          onClick={() => handleViewProposals(demand.id)}
                          className="btn-success text-xs px-2 py-1"
                        >
                          Voir les propositions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'proposals' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Propositions reçues
              </h2>
              {proposals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    Aucune proposition reçue pour le moment
                  </p>
                  <button
                    onClick={() => setActiveTab('demands')}
                    className="btn-success"
                  >
                    Voir mes demandes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="card">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {proposal.artisan?.name || 'Artisan'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {proposal.artisan?.metier || 'Métier non spécifié'}
                      </p>
                      <p className="text-gray-600 mb-2">
                        {proposal.message}
                      </p>
                      <div className="text-sm text-gray-500 mb-2">
                        <p>Prix proposé: {proposal.proposed_price}€</p>
                        {proposal.estimated_duration && (
                          <p>Durée estimée: {proposal.estimated_duration}</p>
                        )}
                        {proposal.availability && (
                          <p>Disponibilité: {proposal.availability}</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        proposal.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : proposal.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-800'
                          : proposal.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {proposal.status === 'PENDING'
                          ? 'En attente'
                          : proposal.status === 'ACCEPTED'
                          ? 'Acceptée'
                          : proposal.status === 'REJECTED'
                          ? 'Refusée'
                          : 'Retirée'}
                      </span>
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-500">
                          {proposal.artisan?.location && `Localisation: ${proposal.artisan.location}`}
                        </p>
                        {proposal.artisan?.phone && (
                          <a href={`tel:${proposal.artisan.phone}`} className="btn-secondary text-xs">
                            Contacter
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Messages
              </h2>
              <MessagingInterface />
            </div>
          )}
        </div>

        {/* Floating Unsubscribe Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => {
              if (confirm(t('unsubscribe.confirm'))) {
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
