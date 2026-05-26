'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import Link from 'next/link'

export default function ArtisanInscriptionInfo() {
  const { user } = useAuth()

  // Helper function to get first name
  const getFirstName = (fullName?: string) => {
    if (!fullName) return ''
    return fullName.split(' ')[0]
  }
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    postalCode: '',
    workType: '',
    specialties: '',
    experience: '',
    certifications: '',
    description: '',
    availability: '',
    travelDistance: '',
    website: '',
    linkedin: '',
    portfolio: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Pre-fill data from localStorage and user context
    const savedArtisanData = localStorage.getItem('artisanSignupData')
    if (savedArtisanData) {
      const parsedData = JSON.parse(savedArtisanData)
      setFormData(prev => ({
        ...prev,
        firstName: parsedData.firstName || '',
        lastName: parsedData.lastName || '',
        phone: parsedData.phone || '',
        city: parsedData.city || '',
        department: parsedData.department || '',
        workType: parsedData.workType || '',
        specialties: parsedData.specialties || '',
        experience: parsedData.experience || '',
        description: parsedData.description || '',
        travelDistance: parsedData.travelDistance || ''
      }))
    }
    
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }))
    }
  }, [user])

  const workTypes = [
    'Plomberie', 'Électricité', 'Chauffage/Climatisation',
    'Maçonnerie', 'Peinture', 'Couverture', 'Menuiserie', 'Charpentier',
    'Plâtrerie', 'Carrelage', 'Vitrerie', 'Jardinerie', 'Démolition', 'Isolation', 'Autre'
  ]

  const departments = [
    '31 - Haute-Garonne', '32 - Gers'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccessMessage('')

    try {
      // Simulate API call to save artisan info
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Save to localStorage for demo
      localStorage.setItem('artisanInfo', JSON.stringify(formData))
      
      setSuccessMessage('Vos informations ont été enregistrées avec succès!')
      setIsLoading(false)
    } catch (error) {
      console.error('Error saving artisan info:', error)
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      {/* Floating Top Right Buttons */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 50, display: 'flex', gap: '8px' }}>
        <Link href="/artisan-dashboard" className="btn-secondary text-sm">
          Espace Artisan
        </Link>
        <Link href="/artisan-dashboard" className="btn-secondary text-sm">
          Demandes des clients
        </Link>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/artisan-dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                &larr; Retour
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Bienvenue, {getFirstName(user?.name)} - Mes informations professionnelles
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="input-field"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="input-field"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Localisation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  className="input-field"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  id="city"
                  className="input-field"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  id="postalCode"
                  className="input-field"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  required
                />
              </div>
              <div id="department-section">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Département
                </label>
                <select
                  id="department"
                  className="input-field"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  required
                >
                  <option value="">Sélectionner un département</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations professionnelles</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="workType" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de travail principal
                </label>
                <select
                  id="workType"
                  className="input-field"
                  value={formData.workType}
                  onChange={(e) => handleInputChange('workType', e.target.value)}
                  required
                >
                  <option value="">Sélectionner un type de travail</option>
                  {workTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="specialties" className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialités (séparez par des virgules)
                </label>
                <input
                  type="text"
                  id="specialties"
                  className="input-field"
                  value={formData.specialties}
                  onChange={(e) => handleInputChange('specialties', e.target.value)}
                  placeholder="Ex: Plomberie sanitaire, Chauffage gaz, Soudure"
                />
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                  Années d'expérience
                </label>
                <input
                  type="number"
                  id="experience"
                  className="input-field"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications et qualifications (séparez par des virgules)
                </label>
                <input
                  type="text"
                  id="certifications"
                  className="input-field"
                  value={formData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  placeholder="Ex: CAP Plombier, QualiPlomb, RGE"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Parcours dans le bâtiment</h2>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description de votre parcours et de vos compétences
              </label>
              <textarea
                id="description"
                rows={6}
                className="input-field"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez votre expérience, vos réalisations principales, votre approche du travail..."
                required
              />
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Disponibilité</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilité
                </label>
                <select
                  id="availability"
                  className="input-field"
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                >
                  <option value="">Sélectionner une disponibilité</option>
                  <option value="immediate">Immédiate</option>
                  <option value="1week">Dans 1 semaine</option>
                  <option value="2weeks">Dans 2 semaines</option>
                  <option value="1month">Dans 1 mois</option>
                  <option value="part-time">Temps partiel</option>
                  <option value="weekends">Week-ends uniquement</option>
                </select>
              </div>
              <div>
                <label htmlFor="travelDistance" className="block text-sm font-medium text-gray-700 mb-2">
                  Distance de déplacement maximale (km)
                </label>
                <input
                  type="number"
                  id="travelDistance"
                  className="input-field"
                  value={formData.travelDistance}
                  onChange={(e) => handleInputChange('travelDistance', e.target.value)}
                  min="0"
                  max="200"
                />
              </div>
            </div>
          </div>

          {/* Online Presence */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Présence en ligne</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  id="website"
                  className="input-field"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://monsite.com"
                />
              </div>
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  id="linkedin"
                  className="input-field"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/monprofil"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio (photos de réalisations)
                </label>
                <input
                  type="url"
                  id="portfolio"
                  className="input-field"
                  value={formData.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
                  placeholder="https://monportfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/artisan-dashboard" className="btn-secondary">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer mes informations'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
