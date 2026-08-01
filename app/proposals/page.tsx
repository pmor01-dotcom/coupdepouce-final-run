'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { t } = useLanguage()

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
        console.error('Error loading proposals:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProposals()
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
            Mes propositions
          </h1>
          <Link
            href="/artisan-dashboard"
            className="inline-block bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
          >
            ← Retour au tableau de bord
          </Link>
        </div>

        {proposals.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <p className="text-gray-700 text-lg">Aucune proposition trouvée.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {proposals.map((proposal: any) => (
              <div
                key={proposal.id}
                className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-gray-900">
                  {proposal.demand?.title || 'Demande sans titre'}
                </h2>

                <p className="text-gray-700 mt-2">{proposal.message}</p>

                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p><strong>Prix proposé :</strong> {proposal.proposed_price}</p>
                  {proposal.estimated_duration && (
                    <p><strong>Durée estimée :</strong> {proposal.estimated_duration}</p>
                  )}
                  {proposal.availability && (
                    <p><strong>Disponibilité :</strong> {proposal.availability}</p>
                  )}
                  <p><strong>Statut :</strong> {proposal.status}</p>
                </div>

                {proposal.demand?.client && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Client</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Nom :</strong> {proposal.demand.client.name}</p>
                      <p><strong>Localisation :</strong> {proposal.demand.client.location}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
