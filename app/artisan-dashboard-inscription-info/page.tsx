'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import Link from 'next/link'

export default function ArtisanProfileEditor() {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    description: '',
    experience_years: '',
    specialties: '',
    phone: '',
    ville: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) return
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/artisan/get-profile')
      if (res.ok) {
        const data = await res.json()
        setFormData({
          description: data.description || '',
          experience_years: data.experience_years || '',
          specialties: data.specialties || '',
          phone: data.phone || '',
          ville: data.ville || ''
        })
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')

    const res = await fetch('/api/artisan/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user?.id,
        ...formData
      })
    })

    if (res.ok) {
      setSuccess('Profil mis à jour avec succès')
    } else {
      alert('Erreur lors de la mise à jour')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
    >
      {/* Fixed right sidebar-style actions */}
      <aside className="fixed top-24 right-4 z-50 flex flex-col gap-3 w-40 sm:w-48">
        <Link href="/artisan-dashboard" className="btn-secondary text-sm w-full text-right">
          Retour au tableau de bord
        </Link>
      </aside>

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Mon Profil Artisan
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <textarea
              className="input-field h-32"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Décrivez votre activité..."
              required
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Années d'expérience</h2>
            <input
              type="number"
              className="input-field"
              value={formData.experience_years}
              onChange={(e) => handleChange('experience_years', e.target.value)}
              min="0"
              max="60"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Spécialités</h2>
            <input
              type="text"
              className="input-field"
              value={formData.specialties}
              onChange={(e) => handleChange('specialties', e.target.value)}
              placeholder="Ex: Maçonnerie, Rénovation..."
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Contact</h2>
            <input
              type="text"
              className="input-field mb-4"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Téléphone"
            />
            <input
              type="text"
              className="input-field"
              value={formData.ville}
              onChange={(e) => handleChange('ville', e.target.value)}
              placeholder="Ville"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/artisan-dashboard" className="btn-secondary">
              Annuler
            </Link>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
