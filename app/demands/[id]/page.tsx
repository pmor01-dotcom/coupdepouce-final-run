'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

type Demand = {
  id: string
  title: string
  category: string | null
  location: string | null
}

export default function DemandPage({ params }) {
  const { id } = params
  const [demand, setDemand] = useState<Demand | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function fetchDemand() {
      const { data, error } = await supabase
        .from('demands')
        .select('*')
        .eq('id', id)
        .single()

      if (!error) {
        setDemand(data as Demand)
      }

      setLoading(false)
    }

    fetchDemand()
  }, [id])

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  if (!demand) {
    return <div className="p-6">Demande introuvable.</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{demand.title}</h1>

      <div className="space-y-2 text-lg">
        <p><strong>Catégorie :</strong> {demand.category || 'Non spécifié'}</p>
        <p><strong>Lieu :</strong> {demand.location || 'Non spécifié'}</p>
      </div>

      <div className="mt-6">
        <a href="/" className="text-blue-600 hover:underline">
          ← Retour à l'accueil
        </a>
      </div>
    </div>
  )
}
