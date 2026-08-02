'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { useLanguage } from '../../components/LanguageProvider'

export default function ClientProposalsPage() {
  const [demands, setDemands] = useState([])
  const [selectedDemandId, setSelectedDemandId] = useState<number | null>(null)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    const loadDemands = async () => {
      if (!user || !user.email) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/demands', {
          headers: {
            'x-user-email': user.email
          }
        })
        if (res.ok) {
          const data = await res.json()
          setDemands(data)
          if (data.length > 0) {
            setSelectedDemandId(data[0].id)
            loadProposals(data[0].id)
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des demandes :', err)
      } finally {
        setLoading(false)
      }
    }

    loadDemands()
  }, [user])

  const loadProposals = async (demandId: number) => {
    try {
      const res = await fetch(`/api/proposals?demandId=${demandId}`)
      if (res.ok) {
        const data = await res.json()
        setProposals(data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des propositions :', err)
    }
  }

  const handleDemandChange = (demandId: number) => {
    setSelectedDemandId(demandId)
    loadProposals(demandId)
  }

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

        {demands.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <p className="text-gray-700 text-lg">
              {t('clientDashboard.noDemandsForProposals') || 'Créez d\'abord une demande pour recevoir des propositions.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('clientDashboard.selectDemand') || 'Sélectionnez une demande'}
              </label>
              <select
                value={selectedDemandId || ''}
                onChange={(e) => handleDemandChange(parseInt(e.target.value))}
                className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {demands.map((demand: any) => (
                  <option key={demand.id} value={demand.id}>
                    {demand.title}
                  </option>
                ))}
              </select>
            </div>

            {proposals.length === 0 ? (
              <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                <p className="text-gray-700 text-lg">
                  {t('clientDashboard.noProposals') || 'Aucune proposition pour cette demande.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {proposals.map((proposal: any) => (
                  <div
                    key={proposal.id}
                    className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {proposal.artisan?.name || 'Artisan inconnu'}
                        </h2>
                        <p className="text-sm text-gray-600">
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

                    <p className="text-gray-700 mb-4">{proposal.message}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
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

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <strong>{t('location')}:</strong> {proposal.artisan?.location || 'N/A'}
                        {proposal.artisan?.phone && (
                          <span className="ml-4">
                            <strong>{t('clientDashboard.phone')}:</strong> {proposal.artisan.phone}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/messages/${proposal.artisan?.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        {t('clientDashboard.contactArtisan') || 'Contacter'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
