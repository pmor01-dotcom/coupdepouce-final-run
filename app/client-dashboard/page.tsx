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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>{t('loading')}</p>
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
            <div className="flex items-center justify-center h-16 md:h-20">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900">{t('clientDashboard.title')}</h1>
            </div>
          </div>
        </header>

        {/* WELCOME */}
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <WelcomeUser />
        </div>

        {/* BUTTONS STACKED VERTICALLY */}
        <div className="max-w-3xl mx-auto px-4 mt-6 w-full">

            <div style={{ marginBottom: '12px', width: '66%', marginLeft: 'auto', marginRight: 'auto' }}>
              <button
                onClick={handleLogout}
                style={{ backgroundColor: '#6b7280', color: 'white', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', width: '100%', cursor: 'pointer', border: 'none', display: 'block' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                {t('dashboard.logout')}
              </button>
            </div>

            <div style={{ marginBottom: '12px', width: '66%', marginLeft: 'auto', marginRight: 'auto' }}>
              <Link href="/client-dashboard/demandes" style={{ backgroundColor: '#6b7280', color: 'white', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', width: '100%', cursor: 'pointer', border: 'none', display: 'block', textAlign: 'center', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                {t('clientDashboard.myDemands')}
              </Link>
            </div>

            <div style={{ marginBottom: '12px', width: '66%', marginLeft: 'auto', marginRight: 'auto' }}>
              <Link href="/create-demand" style={{ backgroundColor: '#6b7280', color: 'white', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', width: '100%', cursor: 'pointer', border: 'none', display: 'block', textAlign: 'center', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                {t('clientDashboard.createDemand')}
              </Link>
            </div>

            <div style={{ marginBottom: '12px', width: '66%', marginLeft: 'auto', marginRight: 'auto' }}>
              <Link href="/client-dashboard/proposals" style={{ backgroundColor: '#6b7280', color: 'white', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', width: '100%', cursor: 'pointer', border: 'none', display: 'block', textAlign: 'center', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                {t('clientDashboard.proposals')}
              </Link>
            </div>

            <div style={{ marginBottom: '12px', width: '66%', marginLeft: 'auto', marginRight: 'auto' }}>
              <Link
                href="/messages"
                style={{ backgroundColor: '#6b7280', color: 'white', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', width: '100%', cursor: 'pointer', border: 'none', display: 'block', textAlign: 'center', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                {t('clientDashboard.messages')}
              </Link>
            </div>

            <div style={{ marginBottom: '12px', width: '66%', marginLeft: 'auto', marginRight: 'auto' }}>
              <Link href="/profile/edit" style={{ backgroundColor: '#6b7280', color: 'white', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', width: '100%', cursor: 'pointer', border: 'none', display: 'block', textAlign: 'center', textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
              >
                {t('clientDashboard.editProfile')}
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
        <div className="max-w-3xl mx-auto px-4 pb-10 flex flex-col items-center">
          <button
            onClick={() => {
              if (confirm(t('unsubscribe.confirm'))) {
                logout()
                router.push('/')
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 md:py-3 rounded-full shadow-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            title={t('unsubscribe.title')}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-xs md:text-sm font-medium">{t('unsubscribe.title')}</span>
          </button>
        </div>

      </main>

      <MessageNotifications />
    </MessagingProvider>
  )
}
