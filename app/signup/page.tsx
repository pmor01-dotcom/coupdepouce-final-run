'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SignupClientPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    department: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    try {
      // 1. Create Supabase user (NO session created because email confirmation is ON)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'client',
            firstName: formData.firstName,
            lastName: formData.lastName,
            city: formData.city,
            department: formData.department,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      const user = data.user
      if (!user) {
        setError("Une erreur est survenue lors de l'inscription")
        setLoading(false)
        return
      }

      // 2. Insert into your "clients" table
      const { error: profileError } = await supabase.from('clients').insert({
        id: user.id,
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        city: formData.city,
        department: formData.department,
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      // 3. Redirect to check-email page (correct flow)
      router.push('/check-email')

    } catch (err: any) {
      setError(err.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Créer un compte client</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input name="firstName" placeholder="Prénom" value={formData.firstName} onChange={handleChange} required />
        <input name="lastName" placeholder="Nom" value={formData.lastName} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirmer le mot de passe" value={formData.confirmPassword} onChange={handleChange} required />
        <input name="city" placeholder="Ville" value={formData.city} onChange={handleChange} required />
        <input name="department" placeholder="Département" value={formData.department} onChange={handleChange} required />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>
    </div>
  )
}
