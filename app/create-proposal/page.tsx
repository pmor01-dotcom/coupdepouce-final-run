'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      setError('Veuillez remplir tous les champs obligatoires')
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
      setError('Erreur lors de la création de la proposition')
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
          <p>Chargement de la demande...</p>
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
                &larr; Retour
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Proposer mes services
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demand Details */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Détails de la demande
          </h2>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-md font-medium text-gray-900">{demand.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{demand.description}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Client:</span> {demand.clientName}
              </div>
              <div>
                <span className="font-medium">Catégorie:</span> {demand.category}
              </div>
              <div>
                <span className="font-medium">Localisation:</span> {demand.location}
              </div>
              <div>
                <span className="font-medium">Département:</span> {demand.department}
              </div>
              <div>
                <span className="font-medium">Budget:</span> {demand.budget}
              </div>
              <div>
                <span className="font-medium">Publié le:</span> {demand.createdAt}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Votre proposition
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message au client *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  className="input-field mt-1"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Décrivez votre solution, votre expérience, et comment vous pouvez aider ce client..."
                />
              </div>

              <div>
                <label htmlFor="proposedPrice" className="block text-sm font-medium text-gray-700">
                  Prix proposé *
                </label>
                <input
                  type="text"
                  id="proposedPrice"
                  required
                  className="input-field mt-1"
                  value={formData.proposedPrice}
                  onChange={(e) => handleInputChange('proposedPrice', e.target.value)}
                  placeholder="Ex: 650, 700-800, devis sur place..."
                />
              </div>

              <div>
                <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700">
                  Durée estimée
                </label>
                <input
                  type="text"
                  id="estimatedDuration"
                  className="input-field mt-1"
                  value={formData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                  placeholder="Ex: 2 jours, 1 semaine, selon devis..."
                />
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                  Disponibilité
                </label>
                <textarea
                  id="availability"
                  rows={2}
                  className="input-field mt-1"
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  placeholder="Quand êtes-vous disponible pour ce travail ?"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p className="font-medium mb-2">Important:</p>
            <ul className="text-sm space-y-1">
              <li>Le client pourra voir votre proposition et vous contacter directement</li>
              <li>Vous ne pouvez pas contacter le client directement avant qu'il ne vous contacte</li>
              <li>Soyez clair et précis dans votre proposition pour augmenter vos chances</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href="/artisan-dashboard" className="btn-secondary">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-success disabled:opacity-50"
            >
              {isLoading ? 'Envoi en cours...' : 'Envoyer la proposition'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
