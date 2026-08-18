'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'

interface Demand {
  id: string
  title: string
  description: string
  category: string
  location: string
  department: string
  budget_range: string
  client_id: string
  created_at: string
}

export default function CreateProposal() {
  const { user } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()

  const [demand, setDemand] = useState<Demand | null>(null)
  const [formData, setFormData] = useState({
    message: '',
    proposedPrice: '',
    estimatedDuration: '',
    availability: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const demandId = urlParams.get('demand')

    if (demandId) {
      fetch(`/api/demands/${demandId}`)
        .then(res => res.json())
        .then(data => {
          if (data) setDemand(data)
          else setError(t('proposal.demandNotFound'))
        })
        .catch(err => {
          console.error('Error fetching demand:', err)
          setError(t('proposal.failedToLoad'))
        })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.message || !formData.proposedPrice) {
      setError(t('proposal.fillRequiredFields'))
      return
    }

    if (!user) {
      setError(t('proposal.mustBeLoggedIn'))
      return
    }

    const token = localStorage.getItem('session_token')
    if (!token) {
      setError(t('proposal.mustBeLoggedIn'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: formData.message,
          proposed_price: formData.proposedPrice,
          estimated_duration: formData.estimatedDuration || null,
          availability: formData.availability || null,
          demand_id: demand?.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('proposal.errorCreating'))
      }

      router.push('/artisan-dashboard')
    } catch (err: any) {
      console.error('Error creating proposal:', err)
      setError(err.message || t('proposal.errorCreating'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!demand) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>{t('proposal.loadingDemand')}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/artisan-dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
              ← {t('proposal.back')}
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              {t('proposal.title')}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('proposal.yourProposal')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('proposal.messageToClient')} *
                </label>
                <textarea
                  required
                  rows={4}
                  className="input-field mt-1"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('proposal.proposedPrice')} *
                </label>
                <input
                  required
                  className="input-field mt-1"
                  value={formData.proposedPrice}
                  onChange={(e) => handleInputChange('proposedPrice', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('proposal.estimatedDuration')}
                </label>
                <input
                  className="input-field mt-1"
                  value={formData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('proposal.availability')}
                </label>
                <textarea
                  rows={2}
                  className="input-field mt-1"
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href="/artisan-dashboard" className="btn-secondary">
              {t('proposal.cancel')}
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-success disabled:opacity-50"
            >
              {isLoading ? t('proposal.sending') : t('proposal.sendProposal')}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
