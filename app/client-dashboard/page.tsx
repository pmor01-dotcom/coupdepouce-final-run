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
      <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#6B8E23] to-[#D4E4BC]">

        {/* Header + Welcome */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <WelcomeUser />
        </div>


        {/* Page Header */}
        <header className="bg-white shadow-sm border-b mt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Espace Client</h1>
              <span className="ml-2 text-sm text-gray-500">{getFirstName(user?.name)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {profile?.ville && (
                <div className="text-sm text-gray-600">{profile.ville}</div>
              )}
              <Link href="/create-demand" className="bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm">
                Créer une demande
              </Link>
              <Link href="/client-profile" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm">
                Mon profil
              </Link>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm">
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* Payment Status */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <PaymentStatus />
        </div>

        {/* MAIN CONTENT AREA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* TABS */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab('demands')}
              className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg text-sm sm:text-base ${activeTab === 'demands' ? 'bg-green-700 text-white' : 'bg-white shadow'}`}
            >
              Mes demandes
            </button>

            <button
              onClick={() => setActiveTab('proposals')}
              className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg text-sm sm:text-base ${activeTab === 'proposals' ? 'bg-green-700 text-white' : 'bg-white shadow'}`}
            >
              Propositions
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="bg-white rounded-xl shadow p-6">

            {activeTab === 'demands' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Vos demandes</h2>

                {demands.length === 0 && (
                  <p className="text-gray-600">Aucune demande pour le moment.</p>
                )}

                <div className="grid gap-4">
                  {demands.map((demand: any) => (
                    <div key={demand.id} className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="text-lg font-semibold">{demand.title}</h3>
                      <p className="text-sm text-gray-600">{demand.description}</p>

                      <button
                        onClick={() => handleViewProposals(demand.id)}
                        className="mt-3 bg-green-700 text-white px-3 py-2 rounded"
                      >
                        Voir les propositions
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'proposals' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Propositions reçues</h2>

                {proposals.length === 0 && (
                  <p className="text-gray-600">Aucune proposition pour le moment.</p>
                )}

                <div className="grid gap-4">
                  {proposals.map((proposal: any) => (
                    <div key={proposal.id} className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="text-lg font-semibold">{proposal.artisan?.name}</h3>
                      <p className="text-sm text-gray-600">{proposal.message}</p>
                      <p className="text-sm mt-2 font-medium">Prix proposé: {proposal.proposed_price}€</p>
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
          className="fixed bottom-6 right-6 z-50 bg-green-700 hover:bg-green-800 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
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
