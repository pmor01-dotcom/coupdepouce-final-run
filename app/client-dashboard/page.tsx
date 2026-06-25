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

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'demands' | 'proposals' | 'messages'>('demands')
  const [demands, setDemands] = useState([])
  const [proposals, setProposals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState(null)

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

        {/* FIXED RIGHT SIDEBAR */}
        <aside className="fixed top-24 right-4 z-50 flex flex-col gap-3 w-40 sm:w-48">

          <button onClick={handleLogout} className="btn-secondary text-sm w-full text-right">
            Déconnexion
          </button>

          <button onClick={() => setActiveTab('demands')} className="btn-secondary text-sm w-full text-right">
            Mes demandes
          </button>

          <Link href="/create-demand" className="btn-secondary text-sm w-full text-right">
            Créer une demande
          </Link>

          <button onClick={() => setActiveTab('proposals')} className="btn-secondary text-sm w-full text-right">
            Propositions reçues
          </button>

          <button onClick={() => setActiveTab('messages')} className="btn-secondary text-sm w-full text-right">
            Messages
          </button>

          <Link href="/client-profile" className="btn-secondary text-sm w-full text-right">
            Modifier mon profil
          </Link>

        </aside>

        {/* Page Header */}
        <header className="bg-white shadow-sm border-b mt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-3xl font-semibold text-gray-900">Espace Client</h1>
              <span className="ml-2 text-sm text-gray-500">{getFirstName(user?.name)}</span>
            </div>

            {profile?.ville && (
              <div className="text-sm text-gray-600">{profile.ville}</div>
            )}
          </div>
        </header>

        {/* Payment Status */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <PaymentStatus />
        </div>

        {/* MAIN CONTENT AREA */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* TABS */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('demands')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'demands' ? 'bg-green-700 text-white' : 'bg-white shadow'}`}
            >
              Mes demandes
            </button>

            <button
              onClick={() => setActiveTab('proposals')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'proposals' ? 'bg-green-700 text-white' : 'bg-white shadow'}`}
            >
              Propositions
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'messages' ? 'bg-green-700 text-white' : 'bg-white shadow'}`}
            >
              Messages
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

            {activeTab === 'messages' && (
              <div>
                <MessagingInterface />
              </div>
            )}

          </div>
        </section>

        {/* Unsubscribe Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => {
              if (confirm(t('unsubscribe.confirm'))) {
                logout()
                router.push('/')
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center space-x-2"
          >
            <span className="text-sm font-medium">{t('unsubscribe.title')}</span>
          </button>
        </div>

      </main>

      <MessageNotifications />
    </MessagingProvider>
  )
}
