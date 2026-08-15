'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import WelcomeUser from '@/app/components/WelcomeUser'
import { getSupabaseClient } from '@/lib/supabase-client'

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
  const supabase = getSupabaseClient()

  // Debug user state
  console.log('ClientDashboard - Auth user:', user)
  console.log('ClientDashboard - localStorage user:', localStorage.getItem('user'))

  const [activeTab, setActiveTab] = useState<'demands' | 'proposals' | 'messages'>('demands')
  const [demands, setDemands] = useState<Demand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  useEffect(() => {
    fetchDemands()
    if (user?.id) {
      fetchUnreadCount()

      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('client-dashboard-messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time message change:', payload)
            // Update unread count when a new message is received
            fetchUnreadCount()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user?.id, supabase])

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

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`/api/messages/unread-count?userId=${user?.id}`)
      const data = await response.json()
      setUnreadCount(data.count || 0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
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
        <div className="flex items-center">
          <WelcomeUser />
          <div className="flex items-center ml-5">
            <Link
              href="/messages"
              className="flex items-center hover:bg-gray-100 transition-colors rounded-full p-2"
              title={t('messages') || 'Messages'}
            >
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="ml-2 bg-red-500 text-white text-lg font-bold rounded-full h-8 w-8 flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </Link>
          </div>
        </div>
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
            <Link
              href="/artisan-directory"
              style={{ backgroundColor: '#6b7280', color: 'white', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', width: '100%', cursor: 'pointer', border: 'none', display: 'block', textAlign: 'center', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
            >
              {t('clientDashboard.artisanDirectory')}
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

      {/* SPACING */}
      <div className="max-w-3xl mx-auto px-4 py-8"></div>

      {/* UNSUBSCRIBE BUTTON */}
      <div className="max-w-3xl mx-auto px-4 pb-10 flex flex-col items-center">
        <button
          onClick={async () => {
            if (confirm(t('unsubscribe.confirm'))) {
              try {
                console.log('=== DELETE ACCOUNT DEBUG ===')
                console.log('Auth user:', user)
                console.log('Auth user ID:', user?.id)
                
                // Check localStorage as fallback for user ID
                const storedUser = localStorage.getItem('user')
                console.log('localStorage user:', storedUser)
                
                let userId = user?.id
                if (!userId && storedUser) {
                  try {
                    const parsed = JSON.parse(storedUser)
                    console.log('Parsed localStorage user:', parsed)
                    userId = parsed.id
                  } catch (e) {
                    console.error('Error parsing localStorage user:', e)
                  }
                }
                
                console.log('Final user ID:', userId)

                if (!userId) {
                  alert('User not authenticated. Please log in again.')
                  router.push('/login')
                  return
                }

                const response = await fetch('/api/auth/delete-account', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ userId }),
                })

                if (response.ok) {
                  logout()
                  localStorage.removeItem('user')
                  router.push('/')
                } else {
                  const data = await response.json()
                  alert('Failed to delete account: ' + (data.error || 'Unknown error'))
                }
              } catch (error) {
                alert('Failed to delete account. Please try again.')
              }
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
  )
}
