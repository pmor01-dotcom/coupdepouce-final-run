'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ProposePage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const params = useParams() as { id: string }

  const [user, setUser] = useState<any>(null)
  const [demand, setDemand] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    loadUser()
  }, [])

  // Load demand
  useEffect(() => {
    const loadDemand = async () => {
      const { data } = await supabase
        .from('demands')
        .select('id, title, description')
        .eq('id', params.id)
        .single()

      setDemand(data)
      setIsLoading(false)
    }

    loadDemand()
  }, [params.id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !demand || !message.trim()) return

    setIsSubmitting(true)

    await supabase.from('proposals').insert({
      message: message.trim(),
      demand_id: demand.id,
      artisan_id: user.id
    })

    router.push('/artisan-dashboard')
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Chargement...</p>
      </main>
    )
  }

  if (!demand) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Demande introuvable.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <button onClick={() => router.back()} className="text-sm text-gray-600 hover:text-gray-800 mb-4">
          ← Retour
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Envoyer une proposition</h1>

        <div className="card p-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-900">{demand.title}</h2>
          <p className="text-sm text-gray-700 mt-2">{demand.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message au client
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Expliquez comment vous pouvez aider…"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => router.back()} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting || !message.trim()} className="btn-primary">
              {isSubmitting ? 'Envoi…' : 'Envoyer la proposition'}
            </button>
          </div>
        </form>

      </div>
    </main>
  )
}
