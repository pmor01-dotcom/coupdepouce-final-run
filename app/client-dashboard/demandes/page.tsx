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
    return <p className="p-6">Chargement…</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mes demandes</h1>

      {demands.length === 0 && (
        <p>Aucune demande trouvée.</p>
      )}

      <ul className="space-y-4">
        {demands.map((demand: any) => (
          <li key={demand.id} className="p-4 bg-white shadow rounded">
            <h2 className="font-semibold">{demand.title}</h2>
            <p>{demand.description}</p>
            <p className="text-sm text-gray-500">Statut : {demand.status}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
