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

interface ArtisanProfile {
  name: string
  email: string
  phone: string
  ville: string
  metier: string
}

export default function ArtisanDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'jobs' | 'proposals' | 'messages'>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<ArtisanProfile | null>(null)

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
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/artisan/get-profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

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
        <p>Chargement...</p>
      </main>
    )
  }

  return (
    <MessagingProvider>
      <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
        
        {/* Floating Buttons */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 sm:hidden items-end">
          <button onClick={handleLogout} className="btn-secondary text-xs px-2 py-1">
            Déconnexion
          </button>
          <button onClick={() => setActiveTab('jobs')} className="btn-secondary text-xs px-2 py-1">
            Travaux
          </button>
          <button onClick={() => { fetchProposals(); setActiveTab('proposals') }} className="btn-secondary text-xs px-2 py-1">
            Propositions
          </button>
          <button onClick={() => setActiveTab('messages')} className="btn-secondary text-xs px-2 py-1">
            Messages
          </button>
          <Link href="/artisan-profile" className="btn-secondary text-xs px-2 py-1">
            Profil
          </Link>
        </div>
        <div className="fixed top-4 right-4 z-50 hidden sm:flex flex-row gap-2">
          <button onClick={handleLogout} className="btn-secondary text-sm whitespace-nowrap">
            Déconnexion
          </button>
          <button onClick={() => setActiveTab('jobs')} className="btn-secondary text-sm whitespace-nowrap">
            Travaux disponibles
          </button>
          <button onClick={() => { fetchProposals(); setActiveTab('proposals') }} className="btn-secondary text-sm whitespace-nowrap">
            Mes propositions
          </button>
          <button onClick={() => setActiveTab('messages')} className="btn-secondary text-sm whitespace-nowrap">
            Messages
          </button>
          <Link href="/artisan-profile" className="btn-secondary text-sm whitespace-nowrap">
            Mon Profil
          </Link>
        </div>
{/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-3xl font-semibold text-gray-900">
                  Espace Artisan
                </h1>
                <span className="ml-2 text-sm text-gray-500">
                  {getFirstName(user?.name)}
                </span>
              </div>
              {profile && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{profile.metier}</span>
                  {profile.ville && <span className="ml-2">• {profile.ville}</span>}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Travaux disponibles
              </h2>

              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    Aucun travail disponible pour le moment
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="card" style={{ maxWidth: '50%', margin: '0 auto' }}>
                      <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{job.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 my-2">
                        <div><span className="font-medium">Localisation:</span> {job.location}</div>
                        <div><span className="font-medium">Département:</span> {job.department}</div>
                        <div><span className="font-medium">Budget:</span> {job.budget_range}</div>
                        <div><span className="font-medium">Urgence:</span> {job.urgency}</div>
                      </div>

                      <p className="text-xs text-gray-500">
                        Publié le {new Date(job.created_at).toLocaleDateString('fr-FR')}
                      </p>

                      <Link href={`/artisan/propose/${job.id}`} className="btn-success text-xs mt-3 inline-block">
                        Faire une proposition
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROPOSALS TAB */}
          {activeTab === 'proposals' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Mes propositions
              </h2>

              {proposals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    Vous n'avez pas encore envoyé de propositions
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="card">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {proposal.client?.name || 'Client'}
                      </h3>
                      <p className="text-gray-600 mb-2">{proposal.message}</p>

                      <p className="text-sm text-gray-500 mb-2">
                        Prix proposé: {proposal.proposed_price}€
                      </p>

                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        proposal.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : proposal.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-800'
                          : proposal.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {proposal.status === 'PENDING'
                          ? 'En attente'
                          : proposal.status === 'ACCEPTED'
                          ? 'Acceptée'
                          : proposal.status === 'REJECTED'
                          ? 'Refusée'
                          : 'Retirée'}
                      </span>

                      <div className="flex justify-between items-center mt-4">
                        {proposal.client?.phone && (
                          <a href={`tel:${proposal.client.phone}`} className="btn-secondary text-xs">
                            Contacter
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Messages
              </h2>
              <MessagingInterface />
            </div>
          )}
        </div>

        {/* Floating Unsubscribe Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => {
              if (confirm('Voulez-vous vraiment vous désinscrire ?')) {
                logout()
                router.push('/')
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-medium">Se désinscrire</span>
          </button>
        </div>
      </main>

      <MessageNotifications />
    </MessagingProvider>
  )
}
