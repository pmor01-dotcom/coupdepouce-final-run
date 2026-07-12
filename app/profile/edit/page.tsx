'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function EditProfile() {
  const { user } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [profileType, setProfileType] = useState<'client' | 'artisan' | null>(null)

  // Shared fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // Artisan-only fields
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [metier, setMetier] = useState('')
  const [description, setDescription] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [specialities, setSpecialities] = useState('')

  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Redirect if user is null
  useEffect(() => {
    if (user === null) {
      router.push('/login')
    }
  }, [user, router])

  // Load profile
  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      // First check users table
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userProfile) {
        setProfileType('client')
        setName(userProfile.name || '')
        setEmail(userProfile.email || '')
        setPhone(userProfile.phone || '')
        setAddress(userProfile.location || '')
        setLoading(false)
        return
      }

      // Otherwise artisan table
      const { data: artisanProfile, error } = await supabase
        .from('artisans')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !artisanProfile) {
        setError('Profile not found.')
        setLoading(false)
        return
      }

      setProfileType('artisan')

      setName(artisanProfile.name || '')
      setEmail(artisanProfile.email || '')
      setPhone(artisanProfile.phone || '')
      setAddress(artisanProfile.ville || '')

      setNom(artisanProfile.nom || '')
      setPrenom(artisanProfile.prenom || '')
      setMetier(artisanProfile.metier || '')
      setDescription(artisanProfile.description || '')
      setExperienceYears(artisanProfile.experience_years || '')
      setSpecialities(artisanProfile.specialities || '')

      setLoading(false)
    }

    loadProfile()
  }, [user])

  // DELETE AVATAR
  const deleteAvatar = async () => {
    setAvatar(null)
    setAvatarFile(null)
  }

  // SAVE PROFILE
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess('')

    let updateData: any = {
      name,
      email,
      phone,
      location: address
    }

    let table = 'users'

    if (profileType === 'artisan') {
      table = 'artisans'
      updateData = {
        name,
        email,
        phone,
        ville: address,
        nom,
        prenom,
        metier,
        description,
        experience_years: experienceYears,
        specialities
      }
    }

    const { error: updateError } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      console.error(updateError)
      setError('Unable to save changes.')
    } else {
      setSuccess('Profile updated successfully.')
    }

    setSaving(false)
  }

  if (loading || !user) {
    return (
      <main className="p-6 text-center text-white bg-green-900 min-h-screen">
        Loading profile...
      </main>
    )
  }

  const returnPath =
    profileType === 'artisan'
      ? '/artisan-dashboard'
      : '/client-dashboard'

  return (
    <main className="min-h-screen bg-green-900 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-10 relative">

        {/* RETURN BUTTON */}
        <button
          onClick={() => router.push(returnPath)}
          className="absolute top-6 left-6 bg-green-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 shadow"
        >
          ← Retour
        </button>

        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center -mt-20 mb-6">
          <div className="relative">
            {avatar ? (
              <Image
                src={avatar}
                alt="Avatar"
                width={140}
                height={140}
                className="rounded-full object-cover shadow-xl border-4 border-white"
              />
            ) : (
              <div className="w-36 h-36 bg-gray-300 rounded-full shadow-xl border-4 border-white" />
            )}
          </div>

          <label className="mt-4 bg-green-900 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-green-800 shadow">
            Uploader une photo de profil
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
          </label>

          {avatar && (
            <button
              type="button"
              onClick={deleteAvatar}
              className="mt-3 text-red-600 text-sm font-medium hover:underline"
            >
              Supprimer la photo
            </button>
          )}
        </div>

        <h1 className="text-3xl font-bold text-center text-green-900 mb-8">
          Modifier mon profil
        </h1>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-700 mb-4 text-center">{success}</p>}

        <form onSubmit={handleSave} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block font-medium mb-1">Nom complet</label>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Téléphone</label>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Ville</label>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {profileType === 'artisan' && (
              <>
                <div>
                  <label className="block font-medium mb-1">Nom</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Prénom</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-medium mb-1">Métier</label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                    value={metier}
                    onChange={(e) => setMetier(e.target.value)}
                  >
                    <option value="">Sélectionnez un métier</option>
                    <option value="Plombier">Plombier</option>
                    <option value="Électricien">Électricien</option>
                    <option value="Menuisier">Menuisier</option>
                    <option value="Peintre">Peintre</option>
                    <option value="Maçon">Maçon</option>
                    <option value="Couvreur">Couvreur</option>
                    <option value="Serrurier">Serrurier</option>
                    <option value="Chauffagiste">Chauffagiste</option>
                    <option value="Plâtrier">Plâtrier</option>
                    <option value="Carreleur">Carreleur</option>
                    <option value="Location d'outils">Location d'outils</option>
                    <option value="Garde d'enfants">Garde d'enfants</option>
                    <option value="Jardinage">Jardinage</option>
                    <option value="Courses">Courses</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                    className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Années d'expérience</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Spécialités</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                    value={specialities}
                    onChange={(e) => setSpecialities(e.target.value)}
                  />
                </div>
              </>
            )}

          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-900 text-white py-3 rounded-lg font-semibold shadow hover:bg-green-800 transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

        </form>
      </div>
    </main>
  )
}