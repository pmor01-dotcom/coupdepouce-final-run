'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'
import { useAuth } from '../components/AuthProvider'

export default function ArtisanSignup() {
  const router = useRouter()
  const { t } = useLanguage()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    // Basic info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Business info
    siret: '',
    companyName: '',
    workType: '',
    specialties: '',
    experience: '',
    
    // Insurance
    hasInsurance: false,
    insuranceDetails: '',
    
    // Business hours
    workDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    },
    workHours: {
      start: '',
      end: ''
    },
    
    // Location
    city: '',
    department: '',
    travelDistance: '',
    
    // Description
    description: '',
    
    // Terms
    agreeToTerms: false
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const workTypes = [
    'Plomberie', 'Électricité', 'Chauffage/Climatisation',
    'Maçonnerie', 'Peinture', 'Couverture', 'Menuiserie', 'Charpentier',
    'Plâtrerie', 'Carrelage', 'Vitrerie', 'Jardinerie', 'Démolition', 'Isolation'
  ]

  const departments = [
    '31 - Haute-Garonne', '32 - Gers'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleWorkDayChange = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workDays: {
        ...prev.workDays,
        [day]: !prev.workDays[day as keyof typeof prev.workDays]
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('signup.passwordMismatch'))
      setLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError(t('signup.acceptTerms'))
      setLoading(false)
      return
    }

    // Check if at least one work day is selected
    const hasWorkDays = Object.values(formData.workDays).some(day => day)
    if (!hasWorkDays) {
      setError(t('signup.selectWorkDay'))
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          role: 'artisan',
          location: formData.city,
          department: formData.department,
          metier: formData.workType,
          phone: formData.phone
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || t('signup.signupError'))
      }

      const loginSuccess = await login(formData.email, formData.password, 'artisan', `${formData.firstName} ${formData.lastName}`)
      if (loginSuccess) {
        await new Promise(resolve => setTimeout(resolve, 100))
        router.push('/artisan-dashboard')
      } else {
        setError(t('common.error'))
      }
    } catch (err: any) {
      setError(err?.message || t('signup.signupError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-700 to-green-200">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('artisanSignup.title')}
          </h2>
          <p className="text-gray-600">
            {t('artisanSignup.subtitle')}
          </p>
          <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg inline-block">
            <p className="text-sm font-medium">
              📍 Service actuellement disponible uniquement dans les départements 31 (Haute-Garonne) et 32 (Gers)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('artisanSignup.personal')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('artisanSignup.business')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro SIRET *
                  </label>
                  <input
                    type="text"
                    name="siret"
                    value={formData.siret}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="14 chiffres"
                    maxLength={14}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de travail principal *
                  </label>
                  <select
                    name="workType"
                    value={formData.workType}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Sélectionner un type de travail</option>
                    {workTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spécialités
                  </label>
                  <input
                    type="text"
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Ex: Plomberie sanitaire, Chauffage gaz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Années d'expérience *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="input-field"
                    min="0"
                    max="50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Insurance */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assurance</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasInsurance"
                    checked={formData.hasInsurance}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Je dispose d'une assurance professionnelle
                  </label>
                </div>
                {formData.hasInsurance && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Détails de l'assurance
                    </label>
                    <textarea
                      name="insuranceDetails"
                      value={formData.insuranceDetails}
                      onChange={handleInputChange}
                      className="input-field"
                      rows={3}
                      placeholder="Type d'assurance, couverture, etc."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Business Hours */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Horaires de travail</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jours de travail *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(formData.workDays).map(([day, checked]) => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleWorkDayChange(day)}
                          className="mr-2"
                        />
                        <span className="text-sm capitalize">
                          {day === 'monday' && 'Lundi'}
                          {day === 'tuesday' && 'Mardi'}
                          {day === 'wednesday' && 'Mercredi'}
                          {day === 'thursday' && 'Jeudi'}
                          {day === 'friday' && 'Vendredi'}
                          {day === 'saturday' && 'Samedi'}
                          {day === 'sunday' && 'Dimanche'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure de début *
                    </label>
                    <input
                      type="time"
                      name="start"
                      value={formData.workHours.start}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        workHours: { ...prev.workHours, start: e.target.value }
                      }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure de fin *
                    </label>
                    <input
                      type="time"
                      name="end"
                      value={formData.workHours.end}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        workHours: { ...prev.workHours, end: e.target.value }
                      }))}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Département *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Sélectionner un département</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance de déplacement (km)
                  </label>
                  <input
                    type="number"
                    name="travelDistance"
                    value={formData.travelDistance}
                    onChange={handleInputChange}
                    className="input-field"
                    min="0"
                    max="200"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Parcours professionnel</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description de votre parcours *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field"
                  rows={4}
                  placeholder="Décrivez votre expérience, vos réalisations, votre parcours..."
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  J'accepte les{' '}
                  <Link href="/terms-artisan" className="text-blue-600 hover:text-blue-500">
                    conditions générales pour les artisans
                  </Link>
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center space-x-4">
              <Link href="/signup" className="btn-secondary">
                {t('app.back')}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? t('artisanSignup.creating') : t('artisanSignup.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
