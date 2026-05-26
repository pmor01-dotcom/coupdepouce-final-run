'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { useLanguage } from '../components/LanguageProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Artisan {
  id: number
  name: string
  metier: string
  location: string
}

export default function CreateDemand() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    department: '',
    budget: '',
    urgency: 'normal'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const categories = [
    'Plomberie', 'Électricité', 'Jardinage', 'Menuiserie', 'Peinture', 
    'Maçonnerie', 'Couvreur', 'Chauffage', 'Climatisation', 'Autre'
  ]

  const departments = [
    '31 - Haute-Garonne', '32 - Gers'
  ]

  useEffect(() => {
    // Check if artisan is pre-selected from URL
    const urlParams = new URLSearchParams(window.location.search)
    const artisanId = urlParams.get('artisan')
    
    if (artisanId) {
      // Mock artisan data - in real app, fetch from API
      const mockArtisan: Artisan = {
        id: parseInt(artisanId),
        name: 'Jean Plombier',
        metier: 'Plomberie',
        location: 'Toulouse'
      }
      setSelectedArtisan(mockArtisan)
      setFormData(prev => ({
        ...prev,
        category: mockArtisan.metier,
        location: mockArtisan.location
      }))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      setError('')

      // Check each field individually
      if (!formData.title) {
        setError('Le titre est requis')
        return
      }
      if (!formData.description) {
        setError('La description est requise')
        return
      }
      if (!formData.category) {
        setError('La catégorie est requise')
        return
      }
      if (!formData.location) {
        setError('La localisation est requise')
        return
      }
      if (!formData.department) {
        setError('Le département est requis')
        return
      }

      if (!user) {
        setError('Vous devez être connecté pour créer une demande')
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
        return
      }

      setIsLoading(true)

      // Create demand via API
      const response = await fetch('/api/demands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          department: formData.department,
          budget_range: formData.budget || null,
          urgency: formData.urgency === 'normal' ? 'NORMAL' : formData.urgency === 'urgent' ? 'URGENT' : 'VERY_URGENT',
          client_id: user.id
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        throw new Error(errorData.error || 'Erreur lors de la création de la demande')
      }

      const result = await response.json()
      
      // Show success message briefly before redirect
      setError('')
      setSuccess('Demande créée avec succès! Redirection...')
      setTimeout(() => {
        router.push('/client-dashboard?tab=demands&refresh=true')
      }, 2000)
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la demande')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    try {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    } catch (error) {
      // Handle error silently
    }
  }

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/client-dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                &larr; Retour
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                {t('createDemand.title')}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: '600px' }}>
        {selectedArtisan && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">{t('createDemand.artisanSelected')}</p>
            <p>{selectedArtisan.name} - {selectedArtisan.metier}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations générales
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre de la demande *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="input-field mt-1"
                  placeholder="Ex: Installation plomberie cuisine"
                  value={formData.title}
                  onChange={(e) => {
                    console.log('Title input changed:', e.target.value)
                    handleInputChange('title', e.target.value)
                  }}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description détaillée *
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  className="input-field mt-1"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez précisément le travail à effectuer..."
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Catégorie *
                </label>
                <select
                  id="category"
                  required
                  className="input-field mt-1"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">
                  Urgence
                </label>
                <select
                  id="urgency"
                  className="input-field mt-1"
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="very_urgent">Très urgent</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Localisation et budget
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Ville ou localisation *
                </label>
                <input
                  type="text"
                  id="location"
                  required
                  className="input-field mt-1"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ex: Toulouse, Paris, Lyon..."
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Département *
                </label>
                <select
                  id="department"
                  required
                  className="input-field mt-1"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                >
                  <option value="">Sélectionnez un département</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                  Budget estimé
                </label>
                <input
                  type="text"
                  id="budget"
                  className="input-field mt-1"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="Ex: 500-800, 1000, moins de 500..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link href="/client-dashboard" className="btn-secondary">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Création en cours...' : 'Publier la demande'}
            </button>
            
                      </div>
        </form>
      </div>
    </main>
  )
}
