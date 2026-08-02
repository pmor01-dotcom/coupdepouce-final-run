'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'

interface Demand {
  id: number
  title: string
  description: string
  category: string
  location: string
  department: string
  budget: string
  clientName: string
  createdAt: string
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
      // Mock demand data - in real app, fetch from API
      const mockDemand: Demand = {
        id: parseInt(demandId),
        title: 'Installation plomberie cuisine',
        description: 'Besoin d\'installer un nouveau évier et robinetterie dans la cuisine. Ancienne installation à démonter.',
        category: 'Plomberie',
        location: 'Toulouse',
        department: '31',
        budget: '500-800',
        clientName: 'Jean Dupont',
        createdAt: '2024-01-15'
      }
      setDemand(mockDemand)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.message || !formData.proposedPrice) {
      setError(t('proposal.fillRequiredFields') || 'Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      // Mock proposal creation - in real app, call API
      const newProposal = {
        id: Math.floor(Math.random() * 1000),
        demandId: demand?.id,
        demandTitle: demand?.title,
        message: formData.message,
        proposedPrice: formData.proposedPrice,
        estimatedDuration: formData.estimatedDuration,
        availability: formData.availability,
        artisanName: user?.name || '',
        artisanEmail: user?.email || '',
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0]
      }

      console.log('Proposal created:', newProposal)
      
      // Redirect to artisan dashboard
      router.push('/artisan-dashboard')
    } catch (err) {
      setError(t('proposal.errorCreating') || 'Error creating proposal')
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
          <p>{t('proposal.loadingDemand') || 'Loading demand...'}</p>
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
                ← {t('proposal.back') || 'Back'}
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                {t('proposal.title') || 'Offer my services'}
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
              {t('proposal.yourProposal') || 'Your proposal'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  {t('proposal.messageToClient') || 'Message to client'} *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="input-field mt-1"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder={t('proposal.messagePlaceholder') || 'Describe your solution, your experience, and how you can help this client...'}
                />
              </div>

              <div>
                <label htmlFor="proposedPrice" className="block text-sm font-medium text-gray-700">
                  {t('proposal.proposedPrice') || 'Proposed price'} *
                </label>
                <input
                  type="text"
                  id="proposedPrice"
                  required
                  className="input-field mt-1"
                  value={formData.proposedPrice}
                  onChange={(e) => handleInputChange('proposedPrice', e.target.value)}
                  placeholder={t('proposal.pricePlaceholder') || 'Ex: 650, 700-800, on-site quote...'}
                />
              </div>

              <div>
                <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700">
                  {t('proposal.estimatedDuration') || 'Estimated duration'}
                </label>
                <input
                  type="text"
                  id="estimatedDuration"
                  className="input-field mt-1"
                  value={formData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                  placeholder={t('proposal.durationPlaceholder') || 'Ex: 2 days, 1 week, depending on quote...'}
                />
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                  {t('proposal.availability') || 'Availability'}
                </label>
                <textarea
                  id="availability"
                  rows={2}
                  className="input-field mt-1"
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  placeholder={t('proposal.availabilityPlaceholder') || 'When are you available for this work?'}
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p className="font-medium mb-2">{t('proposal.important') || 'Important'}:</p>
            <ul className="text-sm space-y-1">
              <li>{t('proposal.note1') || 'The client will be able to see your proposal and contact you directly'}</li>
              <li>{t('proposal.note2') || 'You cannot contact the client directly before they contact you'}</li>
              <li>{t('proposal.note3') || 'Be clear and precise in your proposal to increase your chances'}</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href="/artisan-dashboard" className="btn-secondary">
              {t('proposal.cancel') || 'Cancel'}
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-success disabled:opacity-50"
            >
              {isLoading ? t('proposal.sending') || 'Sending...' : t('proposal.sendProposal') || 'Send proposal'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
