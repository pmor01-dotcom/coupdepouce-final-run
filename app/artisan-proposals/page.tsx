'use client'

import Link from 'next/link'
import { useEffect, useState, startTransition } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'

export default function ArtisanProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { user } = useAuth()
  const { t } = useLanguage()

  const handleDeleteProposal = async (proposalId: number) => {
    if (!confirm(t('clientDashboard.confirmDelete'))) {
      return
    }

    setDeletingId(proposalId)

    try {
      const res = await fetch(`/api/proposals?id=${proposalId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        startTransition(() => {
          setProposals(proposals.filter(p => p.id !== proposalId))
        })
      } else {
        console.error('Failed to delete proposal')
      }
    } catch (err) {
      console.error('Error deleting proposal:', err)
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    const loadProposals = async () => {
      if (!user || !user.id) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/proposals?artisanId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setProposals(data)
        }
      } catch (err) {
        console.error('Erreur lors du chargement des propositions :', err)
      } finally {
        setLoading(false)
      }
    }

    loadProposals()
  }, [user])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">{t('clientDashboard.loading')}</p>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">
            {t('artisanDashboard.myProposals')}
          </h1>
          <Link
            href="/artisan-dashboard"
            className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
          >
            ← {t('clientDashboard.backToDashboard')}
          </Link>
        </div>

        {proposals.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <p className="text-gray-700 text-lg">
              {t('artisanDashboard.noProposals')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal: any) => (
              <div
                key={proposal.id}
                className="rounded-2xl p-6 border-4 border-white"
                style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {proposal.demand?.title || t('clientDashboard.unknownArtisan')}
                    </h2>
                    <p className="text-sm text-white opacity-90">
                      {proposal.demand?.category || t('clientDashboard.unspecifiedTrade')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    proposal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    proposal.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                    proposal.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    proposal.status === 'WITHDRAWN' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {proposal.status}
                  </span>
                </div>

                <p className="text-white mb-4">{proposal.message}</p>

                <div className="grid grid-cols-2 gap-4 text-sm text-white mb-4">
                  <div>
                    <strong>{t('proposal.proposedPrice')}:</strong> {proposal.proposed_price}
                  </div>
                  {proposal.estimated_duration && (
                    <div>
                      <strong>{t('proposal.estimatedDuration')}:</strong> {proposal.estimated_duration}
                    </div>
                  )}
                  {proposal.availability && (
                    <div className="col-span-2">
                      <strong>{t('proposal.availability')}:</strong> {proposal.availability}
                    </div>
                  )}
                  <div>
                    <strong>{t('location')}:</strong> {proposal.demand?.location || 'N/A'}
                  </div>
                  <div>
                    <strong>{t('clientDashboard.createdOn')}:</strong> {new Date(proposal.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-30">
                  <div className="text-sm text-white">
                    <strong>{t('clientDashboard.client')}:</strong> {proposal.demand?.client?.name || 'N/A'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteProposal(proposal.id)}
                      disabled={deletingId === proposal.id}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === proposal.id ? t('clientDashboard.deleting') : t('clientDashboard.delete')}
                    </button>
                    <Link
                      href={`/messages/${proposal.demand?.client_id}?name=${encodeURIComponent(proposal.demand?.client?.name || 'Client')}`}
                      className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-gray-100 text-sm font-medium"
                    >
                      {t('clientDashboard.contactClient')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
