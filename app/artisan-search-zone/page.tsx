'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ArtisanSearchZone() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    currentDepartment: '',
    additionalDepartments: [] as string[],
    travelDistance: '',
    searchRadius: '',
    workTypes: [] as string[]
  })
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Load current artisan data
    const savedArtisanData = localStorage.getItem('artisanSignupData')
    if (savedArtisanData) {
      const parsedData = JSON.parse(savedArtisanData)
      setFormData(prev => ({
        ...prev,
        currentDepartment: parsedData.department || '',
        travelDistance: parsedData.travelDistance || '',
        workTypes: parsedData.workType ? [parsedData.workType] : []
      }))
    }
  }, [])

  const workTypes = [
    'Plomberie', 'Électricité', 'Chauffage/Climatisation',
    'Maçonnerie', 'Peinture', 'Couverture', 'Menuiserie', 'Charpentier',
    'Plâtrerie', 'Carrelage', 'Vitrerie', 'Jardinerie', 'Démolition', 'Isolation'
  ]

  const departments = [
    '31 - Haute-Garonne', '32 - Gers'
  ]

  const handleDepartmentToggle = (department: string) => {
    setFormData(prev => ({
      ...prev,
      additionalDepartments: prev.additionalDepartments.includes(department)
        ? prev.additionalDepartments.filter(d => d !== department)
        : [...prev.additionalDepartments, department]
    }))
  }

  const handleWorkTypeToggle = (workType: string) => {
    setFormData(prev => ({
      ...prev,
      workTypes: prev.workTypes.includes(workType)
        ? prev.workTypes.filter(w => w !== workType)
        : [...prev.workTypes, workType]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccessMessage('')

    try {
      // Save the expanded search zone data
      const searchZoneData = {
        ...formData,
        updatedAt: new Date().toISOString()
      }
      
      localStorage.setItem('artisanSearchZone', JSON.stringify(searchZoneData))
      
      // Update the artisan signup data with new search preferences
      const savedArtisanData = localStorage.getItem('artisanSignupData')
      if (savedArtisanData) {
        const artisanData = JSON.parse(savedArtisanData)
        const updatedArtisanData = {
          ...artisanData,
          department: formData.currentDepartment,
          travelDistance: formData.travelDistance,
          searchZone: searchZoneData
        }
        localStorage.setItem('artisanSignupData', JSON.stringify(updatedArtisanData))
      }

      setSuccessMessage('Votre zone de recherche a été élargie avec succès!')
      
      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/artisan-dashboard')
      }, 2000)
      
    } catch (error) {
      console.error('Error saving search zone:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
      {/* Floating Top Right Buttons */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 50, display: 'flex', gap: '8px' }}>
        <Link href="/artisan-dashboard" className="btn-secondary text-sm">
          Retour au tableau de bord
        </Link>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Élargir ma zone de recherche
            </h1>
            <p className="text-xl text-gray-600">
              Définissez les départements et les types de travaux que vous souhaitez couvrir
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Current Department */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  Votre département actuel
                </label>
                <select
                  value={formData.currentDepartment}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentDepartment: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Sélectionner votre département</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Additional Departments */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  Départements supplémentaires
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez les départements où vous souhaitez intervenir
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-4 border border-gray-200 rounded-lg">
                  {departments.map(dept => (
                    <label key={dept} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.additionalDepartments.includes(dept)}
                        onChange={() => handleDepartmentToggle(dept)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Work Types */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  Types de travaux
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez tous les types de travaux que vous pouvez réaliser
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {workTypes.map(workType => (
                    <label key={workType} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.workTypes.includes(workType)}
                        onChange={() => handleWorkTypeToggle(workType)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{workType}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Travel Distance */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  Distance de déplacement
                </label>
                <select
                  value={formData.travelDistance}
                  onChange={(e) => setFormData(prev => ({ ...prev, travelDistance: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Sélectionner la distance maximale</option>
                  <option value="10km">Jusqu'à 10 km</option>
                  <option value="20km">Jusqu'à 20 km</option>
                  <option value="30km">Jusqu'à 30 km</option>
                  <option value="50km">Jusqu'à 50 km</option>
                  <option value="illimité">Illimité</option>
                </select>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enregistrement...' : 'Élargir ma zone de recherche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
