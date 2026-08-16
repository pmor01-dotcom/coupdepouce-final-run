'use client'

import Link from 'next/link'
import { useAuth } from '../components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../components/LanguageProvider'
import DemandCarousel from '../components/DemandCarousel'
import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function ArtisanDashboard() {
  const { logout, user } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const supabase = getSupabaseClient()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    console.log('ArtisanDashboard - User state:', user)
    console.log('ArtisanDashboard - User ID:', user?.id)
    if (typeof window !== 'undefined') {
      console.log('ArtisanDashboard - localStorage user:', localStorage.getItem('user'))
    }

    if (user?.id) {
      fetchUnreadCount()

      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('artisan-dashboard-messages', {
          config: {
            broadcast: { self: true }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user.id}`
          },
          (payload) => {
            console.log('=== ARTISAN DASHBOARD REAL-TIME MESSAGE UPDATE ===')
            console.log('Message change detected:', payload)
            console.log('Event type:', payload.eventType)
            console.log('New record:', payload.new)
            console.log('Old record:', payload.old)
            // Update unread count when a new message is received
            fetchUnreadCount()
          }
        )
        .subscribe((status) => {
          console.log('=== ARTISAN DASHBOARD SUBSCRIPTION STATUS ===')
          console.log('Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to messages table for user:', user.id)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Subscription error for messages table')
          } else if (status === 'TIMED_OUT') {
            console.error('Subscription timed out for messages table')
          } else if (status === 'CLOSED') {
            console.log('Subscription closed for messages table')
          }
        })

      return () => {
        console.log('=== CLEANING UP ARTISAN DASHBOARD SUBSCRIPTION ===')
        supabase.removeChannel(channel)
      }
    }
  }, [user?.id, supabase])

  const fetchUnreadCount = async () => {
    try {
      console.log('=== ARTISAN DASHBOARD UNREAD COUNT DEBUG ===')
      console.log('Fetching unread count for user:', user?.id)
      const response = await fetch(`/api/messages/unread-count?userId=${user?.id}`)
      const data = await response.json()
      console.log('Unread count response:', data)
      setUnreadCount(data.count || 0)
      console.log('Set unread count to:', data.count || 0)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
    >

      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-center h-16 md:h-20">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
              {t('artisanHeader') || 'Artisan Dashboard'}
            </h1>
          </div>
        </div>
      </header>

      {/* WELCOME WITH NOTIFICATION */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex items-center">
          <p className="text-sm md:text-base text-gray-900">
            {t('welcome')}, {user?.name || 'Artisan'}
          </p>
          <div className="flex items-center ml-5">
            <Link
              href="/artisan-messages"
              className="flex items-center hover:bg-gray-100 transition-colors rounded-full p-4"
              title={t('messages') || 'Messages'}
            >
              <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="ml-2 bg-red-500 text-white text-2xl font-bold rounded-full h-12 w-12 flex items-center justify-center border-4 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="max-w-3xl mx-auto px-4 mt-6 md:mt-10 w-full">

        {/* Logout */}
        <div style={{ marginBottom: '12px', width: '66%', marginLeft: 'auto', marginRight: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              width: '100%',
              cursor: 'pointer',
              border: 'none'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4b5563')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
          >
            {t('logout')}
          </button>
        </div>

        {/* Proposals */}
        <div style={{ marginBottom: '12px', width: '66%', marginLeft: 'auto', marginRight: 'auto' }}>
          <Link
            href="/artisan-proposals"
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              width: '100%',
              cursor: 'pointer',
              border: 'none',
              display: 'block',
              textAlign: 'center',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4b5563')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
          >
            {t('proposals')}
          </Link>
        </div>

        {/* Messages */}
        <div style={{ marginBottom: '12px', width: '66%', marginLeft: 'auto', marginRight: 'auto' }}>
          <Link
            href="/artisan-messages"
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              width: '100%',
              cursor: 'pointer',
              border: 'none',
              display: 'block',
              textAlign: 'center',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4b5563')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
          >
            {t('messages')}
          </Link>
        </div>

        {/* Edit Profile */}
        <div style={{ marginBottom: '12px', width: '66%', marginLeft: 'auto', marginRight: 'auto' }}>
          <Link
            href="/artisan-profile"
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              width: '100%',
              cursor: 'pointer',
              border: 'none',
              display: 'block',
              textAlign: 'center',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4b5563')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
          >
            {t('editProfile')}
          </Link>
        </div>

      </div>

      {/* UNSUBSCRIBE BUTTON */}
      <div className="max-w-3xl mx-auto px-4 pb-6 md:pb-10 mt-6 md:mt-10 flex flex-col items-center">
        <button
          onClick={async () => {
            if (confirm(t('unsubscribeConfirm'))) {
              try {
                // Check localStorage as fallback for user ID
                const storedUser: string | null = typeof window !== 'undefined' ? localStorage.getItem('user') : null
                const userId = user?.id || (storedUser ? JSON.parse(storedUser).id : null)

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
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('user')
                  }
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
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-xs md:text-sm font-medium">{t('unsubscribe')}</span>
        </button>
      </div>

      {/* DEMAND CAROUSEL */}
      <DemandCarousel />

    </main>
  )
}
