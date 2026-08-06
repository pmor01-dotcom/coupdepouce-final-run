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
    // Get demand ID from URL
    const urlParams = new URLSearchParams(window.location.search)
    const demandId = urlParams.get('demand')

    if (demandId) {
      // Fetch real demand data from API
      fetch(`/api/demands/${demandId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setDemand(data)
          } else {
            setError(t('proposal.demandNotFound'))
          }
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
      setError(t('proposal.fillRequiredFields') || 'Please fill in all required fields')
      return
    }

    if (!user) {
      setError(t('proposal.mustBeLoggedIn'))
      return
    }

    if (!user.id) {
      console.error('User object missing id:', user)
      setError(t('proposal.userIdNotFound'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: formData.message,
          proposed_price: formData.proposedPrice,
          estimated_duration: formData.estimatedDuration || null,
          availability: formData.availability || null,
          demand_id: demand?.id,
          artisan_id: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || t('proposal.errorCreating'))
      }

      console.log('Proposal created:', result)

      // Redirect to artisan dashboard
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
        <div className="text-center">
          <p>{t('proposal.loadingDemand')}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/artisan-dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                ← {t('proposal.back')}
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                {t('proposal.title')}
              </h1>
            </div>
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
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  {t('proposal.messageToClient')} *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="input-field mt-1"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder={t('proposal.messagePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="proposedPrice" className="block text-sm font-medium text-gray-700">
                  {t('proposal.proposedPrice')} *
                </label>
                <input
                  type="text"
                  id="proposedPrice"
                  required
                  className="input-field mt-1"
                  value={formData.proposedPrice}
                  onChange={(e) => handleInputChange('proposedPrice', e.target.value)}
                  placeholder={t('proposal.pricePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700">
                  {t('proposal.estimatedDuration')}
                </label>
                <input
                  type="text"
                  id="estimatedDuration"
                  className="input-field mt-1"
                  value={formData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                  placeholder={t('proposal.durationPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                  {t('proposal.availability')}
                </label>
                <textarea
                  id="availability"
                  rows={2}
                  className="input-field mt-1"
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  placeholder={t('proposal.availabilityPlaceholder')}
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p className="font-medium mb-2">{t('proposal.important')}:</p>
            <ul className="text-sm space-y-1">
              <li>{t('proposal.note1')}</li>
              <li>{t('proposal.note2')}</li>
              <li>{t('proposal.note3')}</li>
            </ul>
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
