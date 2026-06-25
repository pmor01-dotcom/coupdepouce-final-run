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

  const [activeTab, setActiveTab] = useState<'jobs' | 'proposals' | 'messages'>('jobs')
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

        {/* Floating Buttons (fixed + mobile safe) */}
        <div className="fixed top-24 right-4 flex flex-col gap-3 z-50 max-w-[90vw] overflow-hidden">

          <button
            onClick={handleLogout}
            className="btn-secondary text-sm w-full max-w-[160px] text-left"
          >
            Déconnexion
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className="btn-secondary text-sm w-full max-w-[160px] text-left"
          >
            Travaux disponibles
          </button>

          <button
            onClick={() => { fetchProposals(); setActiveTab('proposals') }}
            className="btn-secondary text-sm w-full max-w-[160px] text-left"
          >
            Mes propositions
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className="btn-secondary text-sm w-full max-w-[160px] text-left"
          >
            Messages
          </button>

          <Link
            href="/artisan-dashboard-inscription-info"
            className="btn-secondary text-sm w-full max-w-[160px] text-left"
          >
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
                    <div key={job.id} className="card w-full max-w-md mx-auto">
                      <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{job.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 my-2">
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
