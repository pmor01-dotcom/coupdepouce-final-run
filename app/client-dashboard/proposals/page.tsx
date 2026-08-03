'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { useLanguage } from '../../components/LanguageProvider'

export default function ClientProposalsPage() {
  const [allProposals, setAllProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    const loadAllProposals = async () => {
      if (!user || !user.email) {
        console.log('No user or email')
        setLoading(false)
        return
      }

      try {
        console.log('Loading demands for user:', user.email)
        // First get all demands for this user
        const demandsRes = await fetch('/api/demands', {
          headers: {
            'x-user-email': user.email
          }
        })

        if (demandsRes.ok) {
          const demands = await demandsRes.json()
          console.log('Demands found:', demands.length, demands)

          if (demands.length === 0) {
            console.log('No demands found for this user')
            setAllProposals([])
            setLoading(false)
            return
          }

          // Load proposals for each demand
          const proposalsPromises = demands.map((demand: any) =>
            fetch(`/api/proposals?demandId=${demand.id}`)
              .then(res => {
                console.log('Proposals response for demand', demand.id, ':', res.status)
                return res.ok ? res.json() : []
              })
              .then(data => {
                console.log('Proposals for demand', demand.id, ':', data.length)
                return data
              })
          )

          const allProposalsData = await Promise.all(proposalsPromises)
          const flattenedProposals = allProposalsData.flat()

          console.log('Total proposals:', flattenedProposals.length)
          setAllProposals(flattenedProposals)
        } else {
          console.error('Failed to load demands:', demandsRes.status)
        }
      } catch (err) {
        console.error('Erreur lors du chargement des propositions :', err)
      } finally {
        setLoading(false)
      }
    }

    loadAllProposals()
  }, [user])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Chargement…</p>
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
            {t('clientDashboard.proposals') || 'Propositions reçues'}
          </h1>
          <Link
            href="/client-dashboard"
            className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
          >
            ← Retour au tableau de bord
          </Link>
        </div>

        {allProposals.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <p className="text-gray-700 text-lg">
              {t('clientDashboard.noProposals') || 'Aucune proposition reçue.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {allProposals.map((proposal: any) => (
              <div
                key={proposal.id}
                className="rounded-2xl p-6 border-4 border-white"
                style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {proposal.artisan?.name || 'Artisan inconnu'}
                    </h2>
                    <p className="text-sm text-white opacity-90">
                      {proposal.artisan?.metier || 'Métier non spécifié'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    proposal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    proposal.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                    proposal.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
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
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-30">
                  <div className="text-sm text-white">
                    <strong>{t('location')}:</strong> {proposal.artisan?.location || 'N/A'}
                    {proposal.artisan?.phone && (
                      <span className="ml-4">
                        <strong>{t('clientDashboard.phone')}:</strong> {proposal.artisan.phone}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/messages/${proposal.artisan?.id}`}
                    className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-gray-100 text-sm font-medium"
                  >
                    {t('clientDashboard.contactArtisan') || 'Contacter'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
