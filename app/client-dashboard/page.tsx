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

interface ClientProfile {
  name: string
  email: string
  phone: string
  ville: string
}

export default function ClientDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'demands' | 'proposals' | 'messages'>('demands')
  const [demands, setDemands] = useState<Demand[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
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

  // ⭐ THIS WAS MISSING — FIXED
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Chargement...</p>
        </div>
      </main>
    )
  }

  // ⭐ THIS BRACE WAS MISSING — FIXED
  return (
    <MessagingProvider>
      <main
        className="min-h-screen"
        style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
      >

        {/* Welcome */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <WelcomeUser />
        </div>

        {/* Right-side vertical button bar */}
<div className="fixed top-4 right-4 z-50 flex flex-col sm:flex-row gap-2 sm:gap-2">

  <button onClick={handleLogout} className="btn-secondary text-sm whitespace-nowrap">
    Déconnexion
  </button>

  <button onClick={() => setActiveTab('demands')} className="btn-secondary text-sm whitespace-nowrap">
    Mes demandes
  </button>

  <Link href="/create-demand" className="btn-secondary text-sm whitespace-nowrap">
    Créer une demande
  </Link>

  <button onClick={() => setActiveTab('proposals')} className="btn-secondary text-sm whitespace-nowrap">
    Propositions reçues
  </button>

  <button onClick={() => setActiveTab('messages')} className="btn-secondary text-sm whitespace-nowrap">
    Messages
  </button>

  <Link href="/client-profile" className="btn-secondary text-sm whitespace-nowrap">
    Modifier mon profil
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
              {profile && profile.ville && (
                <div className="text-sm text-gray-600">
                  <span>{profile.ville}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Payment Status */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <PaymentStatus />
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ... REST OF YOUR CONTENT (unchanged) ... */}
        </div>

        {/* Unsubscribe Button */}
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
