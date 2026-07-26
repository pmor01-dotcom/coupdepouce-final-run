'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { useLanguage } from '../../components/LanguageProvider'

type Demand = {
  id: string
  title: string
  description: string
}

export default function ProposePage() {
  const supabase = getSupabaseClient()
  const router = useRouter()
  const { t } = useLanguage()
  const params = useParams() as { id: string }

  const [user, setUser] = useState<any>(null)
  const [demand, setDemand] = useState<Demand | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  console.log('ProposePage rendered with params:', params)

  // Load auth user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Auth user:', user)
      setUser(user)
      
      // Don't redirect - let user see the page even if not authenticated
      // They'll need to auth to submit the proposal
    }
    loadUser()
  }, [])

  // Load demand
  useEffect(() => {
    const loadDemand = async () => {
      if (!params?.id) return

      console.log('Loading demand with ID:', params.id, 'Type:', typeof params.id)

      const { data, error } = await supabase
        .from('demands')
        .select('id, title, description')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error loading demand:', error)
      }

      console.log('Demand data:', data)
      setDemand(data)
      setIsLoading(false)
    }

    loadDemand()
  }, [params?.id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !demand || !message.trim()) return

    try {
      setIsSubmitting(true)

      const { error } = await supabase
        .from('proposals')
        .insert({
          message: message.trim(),
          demand_id: demand.id,
          artisan_id: user.id
        })

      if (error) {
        console.error('Error creating proposal:', error)
        setIsSubmitting(false)
        return
      }

      router.push('/artisan-dashboard')
    } catch (err) {
      console.error('Unexpected error creating proposal:', err)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>{t('proposals.loading')}</p>
      </main>
    )
  }

  if (!demand) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>{t('proposals.demandNotFound')}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          ← {t('proposals.back')}
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('proposals.title')}
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          {t('proposals.respondingTo')}
        </p>

        <div className="card p-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-900">{demand.title}</h2>
          <p className="text-sm text-gray-700 mt-2">{demand.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('proposals.messageLabel')}
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('proposals.messagePlaceholder')}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              {t('proposals.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="btn-primary"
            >
              {isSubmitting ? t('proposals.sending') : t('proposals.send')}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
