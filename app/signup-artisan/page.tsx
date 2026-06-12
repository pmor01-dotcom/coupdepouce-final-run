 <'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ❌ REMOVE THIS (it breaks auth)
// import { supabase } from '../../lib/supabaseClient'

// ✅ USE THE CORRECT CLIENT (attaches browser session)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import { useLanguage } from '../components/LanguageProvider'
import { useAuth } from '../components/AuthProvider'

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  siret: string
  jobType: string
  specialties: string
  city: string
  department: string
  distanceKm: string
  description: string
}

export default function ArtisanSignup() {
  const router = useRouter()
  const { t } = useLanguage()
  const { login } = useAuth()

  // ✅ Correct Supabase client for client components
  const supabase = createClientComponentClient()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    siret: '',
    jobType: '',
    specialties: '',
    city: '',
    department: '',
    distanceKm: '',
    description: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Email et mot de passe sont obligatoires.')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    try {
      // 1️⃣ Create user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // 2️⃣ Force login (important when email confirmation is ON)
      await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      // 3️⃣ Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Impossible de récupérer l'utilisateur après l'inscription.")
        setLoading(false)
        return
      }

      // 4️⃣ Insert artisan profile (authenticated request)
      const { error: profileError } = await supabase.from('artisans').insert({
        id: user.id, // IMPORTANT: must match RLS policy
        firstname: formData.firstName,
        lastname: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        siret: formData.siret,
        job_type: formData.jobType,
        specialties: formData.specialties,
        city: formData.city,
        department: formData.department,
        distance_km: formData.distanceKm ? Number(formData.distanceKm) : null,
        description: formData.description,
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      // 5️⃣ Redirect
      router.push('/artisan-dashboard')

    } catch (err) {
      setError('Une erreur inattendue est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold mb-6">
          {t ? t('signup.artisanTitle') : 'Inscription Artisan'}
        </h1>

        {error && (
          <div className="mb-4 rounded bg-red-100 text-red-700 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom / Prénom */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium mb-1">Prénom</label>
    <input
      type="text"
      name="firstName"
      value={formData.firstName}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 text-sm"
      required
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Nom</label>
    <input
      type="text"
      name="lastName"
      value={formData.lastName}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 text-sm"
      required
    />
  </div>
</div>

{/* Email / Téléphone */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium mb-1">Email</label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 text-sm"
      required
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Téléphone</label>
    <input
      type="tel"
      name="phone"
      value={formData.phone}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 text-sm"
    />
  </div>
</div>

{/* Mot de passe */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium mb-1">Mot de passe</label>
    <input
      type="password"
      name="password"
      value={formData.password}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 text-sm"
      required
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
    <input
      type="password"
      name="confirmPassword"
      value={formData.confirmPassword}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 text-sm"
      required
    />
  </div>
</div>

{/* Infos artisan */}
<div>
  <label className="block text-sm font-medium mb-1">SIRET</label>
  <input
    type="text"
    name="siret"
    value={formData.siret}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2 text-sm"
  />
</div>

<div>
  <label className="block text-sm font-medium mb-1">Métier / Type d'activité</label>
  <input
    type="text"
    name="jobType"
    value={formData.jobType}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2 text-sm"
  />
</div>

<div>
  <label className="block text-sm font-medium mb-1">Spécialités</label>
  <input
    type="text"
    name="specialties"
    value={formData.specialties}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2 text-sm"
  />
</div>

{/* Localisation */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>
    <label className="block text-sm font-medium mb-1">Ville</label>
    <input
      type="text"
      name="city"
      value={formData.city}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 text-sm"
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Département</label>
    <input
      type="text"
      name="department"
      value={formData.department}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 text-sm"
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-1">Distance max (km)</label>
    <input
      type="number"
      name="distanceKm"
      value={formData.distanceKm}
      onChange={handleChange}
      className="w-full border rounded px-3 py-2 text-sm"
    />
  </div>
</div>

{/* Description */}
<div>
  <label className="block text-sm font-medium mb-1">Description</label>
  <textarea
    name="description"
    value={formData.description}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2 text-sm"
    rows={4}
  />
</div>

{/* Actions */}
<div className="flex items-center justify-between pt-4">
  <Link href="/login" className="text-sm text-blue-600 hover:underline">
    Déjà un compte ? Se connecter
  </Link>

  <button
    type="submit"
    disabled={loading}
    className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
  >
    {loading ? 'Création en cours...' : 'Créer mon compte'}
  </button>
</div>

</form>
</div>
</div>
)
}
