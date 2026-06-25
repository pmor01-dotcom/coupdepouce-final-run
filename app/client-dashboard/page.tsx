'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import { MessagingProvider } from '../components/MessagingProvider'
import MessagingInterface from '../components/MessagingInterface'
import MessageNotifications from '../components/MessageNotifications'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PaymentStatus from '../components/PaymentStatus'
import WelcomeUser from '../components/WelcomeUser'

interface ClientProfile {
  name: string
  email: string
  phone: string
  ville?: string
}

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'demands' | 'proposals'>('demands')
  const [showMessages, setShowMessages] = useState(false)
  const [demands, setDemands] = useState([])
  const [proposals, setProposals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<ClientProfile | null>(null)

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
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/client/get-profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

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
        <p>Chargement...</p>
      </main>
    )
  }

  return (
    <MessagingProvider>
      <main className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>

        {/* Site Title */}
        <div className="container mx-auto px-4 py-8">
          <div className="site-title text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Coupdepouce</h2>
          </div>
        </div>

        {/* Page Header */}
        <header className="bg-white rounded-xl shadow-lg mx-4 sm:mx-6 lg:mx-auto max-w-7xl mb-6">
          <div className="px-6 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Espace Client</h1>
              <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{getFirstName(user?.name)}</span>
            </div>

            <div className="flex flex-col items-start gap-2 w-full sm:w-auto">
              {profile?.ville && (
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">📍 {profile.ville}</div>
              )}
              <Link href="/create-demand" className="flex-1 min-w-[140px] px-5 py-3 rounded-xl text-sm sm:text-base font-medium transition-all bg-white/70 text-gray-700 hover:bg-white">
                ➕ Créer une demande
              </Link>
              <Link href="/client-profile" className="flex-1 min-w-[140px] px-5 py-3 rounded-xl text-sm sm:text-base font-medium transition-all bg-white/70 text-gray-700 hover:bg-white">
                👤 Mon profil
              </Link>
              <button onClick={handleLogout} className="flex-1 min-w-[140px] px-5 py-3 rounded-xl text-sm sm:text-base font-medium transition-all bg-white/70 text-gray-700 hover:bg-white">
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* Payment Status */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <PaymentStatus />
        </div>

        {/* MAIN CONTENT AREA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

          {/* TABS */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setActiveTab('demands')}
              className={`flex-1 min-w-[140px] px-5 py-3 rounded-xl text-sm sm:text-base font-medium transition-all ${activeTab === 'demands' ? 'bg-white text-green-700 shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white'}`}
            >
              📋 Mes demandes
            </button>

            <button
              onClick={() => setActiveTab('proposals')}
              className={`flex-1 min-w-[140px] px-5 py-3 rounded-xl text-sm sm:text-base font-medium transition-all ${activeTab === 'proposals' ? 'bg-white text-green-700 shadow-lg' : 'bg-white/70 text-gray-700 hover:bg-white'}`}
            >
              💬 Propositions
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">

            {activeTab === 'demands' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos demandes</h2>

                {demands.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 text-lg">Aucune demande pour le moment.</p>
                    <Link href="/create-demand" className="inline-block mt-4 flex-1 min-w-[140px] px-5 py-3 rounded-xl text-sm sm:text-base font-medium transition-all bg-white/70 text-gray-700 hover:bg-white">
                      Créer votre première demande →
                    </Link>
                  </div>
                )}

                <div className="grid gap-4">
                  {demands.map((demand: any) => (
                    <div key={demand.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{demand.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{demand.description}</p>

                      <button
                        onClick={() => handleViewProposals(demand.id)}
                        className="flex-1 min-w-[140px] px-5 py-3 rounded-xl text-sm sm:text-base font-medium transition-all bg-white/70 text-gray-700 hover:bg-white"
                      >
                        👁️ Voir les propositions
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'proposals' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Propositions reçues</h2>

                {proposals.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 text-lg">Aucune proposition pour le moment.</p>
                  </div>
                )}

                <div className="grid gap-4">
                  {proposals.map((proposal: any) => (
                    <div key={proposal.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{proposal.artisan?.name}</h3>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Artisan</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{proposal.message}</p>
                      <p className="text-sm font-semibold text-green-700">💰 Prix proposé: {proposal.proposed_price}€</p>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        </section>

        {/* Floating Messages Button */}
        <button
          onClick={() => setShowMessages(true)}
          className="fixed bottom-6 right-6 z-50 bg-green-700 hover:bg-green-800 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>

        {/* Messages Modal */}
        {showMessages && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">Messages</h2>
                <button
                  onClick={() => setShowMessages(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <MessagingInterface />
              </div>
            </div>
          </div>
        )}

      </main>

      <MessageNotifications />
    </MessagingProvider>
  )
}
