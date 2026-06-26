'use client'

import { useEffect, useState } from 'react'

export default function MesDemandes() {
  const [demands, setDemands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDemands = async () => {
      try {
        const res = await fetch('/api/demands')
        if (res.ok) {
          const data = await res.json()
          setDemands(data)
        }
      } catch (err) {
        console.error('Erreur lors du chargement des demandes :', err)
      } finally {
        setLoading(false)
      }
    }

    loadDemands()
  }, [])

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
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">
          Mes demandes
        </h1>

        {demands.length === 0 && (
          <p className="text-gray-700 text-lg">Aucune demande trouvée.</p>
        )}

        {/* Cards container */}
        <div className="space-y-6">
          {demands.map((demand: any) => (
            <div
              key={demand.id}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {demand.title}
              </h2>

              <p className="text-gray-700 mt-2">{demand.description}</p>

              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p><strong>Catégorie :</strong> {demand.category}</p>
                <p><strong>Département :</strong> {demand.department}</p>
                <p><strong>Budget :</strong> {demand.budget_range}</p>
                <p><strong>Statut :</strong> {demand.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
