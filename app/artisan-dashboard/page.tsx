'use client'

import Link from 'next/link'
import { useAuth } from '../components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../components/LanguageProvider'
import DemandCarousel from '../components/DemandCarousel'

export default function ArtisanDashboard() {
  const { logout } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()

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
          onClick={() => {
            if (confirm(t('unsubscribeConfirm'))) {
              logout()
              router.push('/')
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
