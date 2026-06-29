'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import { MessagingProvider } from '../components/MessagingProvider'
import MessageNotifications from '../components/MessageNotifications'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PaymentStatus from '../components/PaymentStatus'
import WelcomeUser from '@/app/components/WelcomeUser'

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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Chargement...</p>
      </main>
    )
  }

  return (
    <MessagingProvider>
      <main
        className="min-h-screen overflow-x-hidden"
        style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
      >

        {/* HEADER AT TOP */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center justify-center h-20">
              <h1 className="text-4xl font-bold text-gray-900">Espace Artisan</h1>
            </div>
          </div>
        </header>

        {/* WELCOME */}
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <WelcomeUser />
        </div>

        {/* BUTTONS STACKED VERTICALLY */}
        <div className="max-w-3xl mx-auto px-4 mt-6">
          <div className="flex flex-col gap-3 w-full">

            <button
              onClick={handleLogout}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full"
            >
              Déconnexion
            </button>

            <Link href="/artisan-dashboard/demandes" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full text-center">
              Mes demandes
            </Link>

            <Link href="/create-demand" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full text-center">
              Créer une demande
            </Link>

            <button
              onClick={() => setActiveTab('proposals')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full"
            >
              Propositions reçues
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full"
            >
              Messages
            </button>

            <Link href="/profile/edit" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full text-center">
              Modifier mon profil
            </Link>

          </div>
        </div>

        {/* PAYMENT STATUS */}
        <div className="max-w-3xl mx-auto px-4 mt-6">
          <PaymentStatus />
        </div>

        {/* SPACING */}
        <div className="max-w-3xl mx-auto px-4 py-8"></div>

        {/* UNSUBSCRIBE BUTTON */}
        <div className="max-w-3xl mx-auto px-4 pb-10">
          <button
            onClick={() => {
              if (confirm(t('unsubscribe.confirm'))) {
                logout()
                router.push('/')
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center justify-center space-x-2 transition-colors duration-200 w-full"
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
