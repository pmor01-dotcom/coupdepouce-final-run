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

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [metier, setMetier] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Redirect if user is null (fixes Vercel build)
  useEffect(() => {
    if (user === null) {
      router.push('/login')
    }
  }, [user, router])

  // Load profile
  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: artisan } = await supabase
        .from('artisans')
        .select('*')
        .eq('id', user.id)
        .single()

      const profile = client || artisan

      if (!profile) {
        setError('Profile not found.')
        setLoading(false)
        return
      }

      setProfileType(client ? 'client' : 'artisan')

      setName(profile.name || '')
      setEmail(profile.email || '')
      setPhone(profile.phone || '')
      setAddress(profile.address || '')
      setMetier(profile.metier || '')
      setAvatar(profile.avatar_url || null)

      setLoading(false)
    }

    loadProfile()
  }, [user])

  // DELETE AVATAR (Option B: only remove from DB)
  const deleteAvatar = async () => {
    if (!user) return
    if (!avatar) return

    const table = profileType === 'artisan' ? 'artisans' : 'clients'

    await supabase
      .from(table)
      .update({ avatar_url: null })
      .eq('id', user.id)

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

    let avatarUrl = avatar

    if (avatarFile) {
      const fileName = `${user.id}-${Date.now()}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile)

      if (uploadError) {
        setError('Error uploading avatar.')
        setSaving(false)
        return
      }

      avatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl
    }

    const table = profileType === 'artisan' ? 'artisans' : 'clients'

    const { error: updateError } = await supabase
      .from(table)
      .update({
        name,
        email,
        phone,
        address,
        metier,
        avatar_url: avatarUrl
      })
      .eq('id', user.id)

    if (updateError) {
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

          {/* Upload Button */}
          <label className="mt-4 bg-green-900 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-green-800 shadow">
            Uploader une photo de profil
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
          </label>

          {/* Delete Photo Button */}
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
          Edit My Profile
        </h1>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-700 mb-4 text-center">{success}</p>}

        {/* FORM */}
        <form onSubmit={handleSave} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block font-medium mb-1">Full Name</label>
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
              <label className="block font-medium mb-1">Phone</label>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Address</label>
              <input
                type="text"
                className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {profileType === 'artisan' && (
              <div className="md:col-span-2">
                <label className="block font-medium mb-1">Trade / Profession</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-green-700"
                  value={metier}
                  onChange={(e) => setMetier(e.target.value)}
                />
              </div>
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
