'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import { MessagingProvider } from '../components/MessagingProvider'
import MessagingInterface from '../components/MessagingInterface'
import MessageNotifications from '../components/MessageNotifications'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Job {
  id: number
  title: string
  description: string
  location: string
  department: string
  budget_range: string
  urgency: string
  status: string
  created_at: string
}

interface Proposal {
  id: number
  demand_id: number
  message: string
  proposed_price: string
  status: string
  created_at: string
  client?: {
    id: number
    name: string
    location: string
    phone: string
  }
}

export default function ArtisanDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'proposals' | 'messages'>('proposals')
  const [jobs, setJobs] = useState<Job[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getFirstName = (fullName?: string) => {
    if (!fullName) return ''
    return fullName.split(' ')[0]
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/artisan/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/artisan/proposals')
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
        <p>{t('common.loading')}</p>
      </main>
    )
  }

  return (
    <MessagingProvider>
      <main
        className="min-h-screen overflow-x-hidden"
        style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
      >
        {/* Centered Title at Top */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-semibold text-white">
            {t('app.title')}
          </h1>
        </div>

        {/* Floating Buttons */}
        <div className="fixed top-40 right-4 z-50 grid grid-cols-1 gap-3 max-w-[90vw]">

          <button
            onClick={handleLogout}
            className="btn-secondary text-sm w-full max-w-[160px] text-left"
          >
            {t('dashboard.logout')}
          </button>

          <button
            onClick={() => { fetchProposals(); setActiveTab('proposals') }}
            className="btn-secondary text-sm w-full max-w-[160px] text-left"
          >
            {t('clientDashboard.myDemands')}
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className="btn-secondary text-sm w-full max-w-[160px] text-left"
          >
            {t('clientDashboard.messages')}
          </button>

          <button
            onClick={() => {
              if (confirm(t('unsubscribe.confirm'))) {
                logout()
                router.push('/')
              }
            }}
            className="btn-secondary text-sm w-full max-w-[160px] text-left"
          >
            {t('unsubscribe.title')}
          </button>

        </div>

        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">
                  {t('common.welcome')}, {getFirstName(user?.name)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* PROPOSALS TAB */}
          {activeTab === 'proposals' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('clientDashboard.myDemands')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {proposal.client?.name || 'Client'}
                    </h3>
                    <p className="text-gray-600 mb-2">{proposal.message}</p>

                    <p className="text-sm text-gray-500 mb-2">
                      {proposal.proposed_price}€
                    </p>

                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {proposal.status}
                    </span>

                    <div className="flex justify-between items-center mt-4">
                      {proposal.client?.phone && (
                        <a href={`tel:${proposal.client.phone}`} className="btn-secondary text-xs">
                          {t('dashboard.contactArtisan')}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('clientDashboard.messages')}
              </h2>
              <MessagingInterface />
            </div>
          )}
        </div>

      </main>

      <MessageNotifications />
    </MessagingProvider>
  )
}
