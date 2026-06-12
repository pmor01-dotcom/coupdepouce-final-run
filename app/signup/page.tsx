'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Signup() {
  const { t } = useLanguage()
  const router = useRouter()

  // ✔ Supabase client (correct one)
  const supabase = createClientComponentClient()

  const [role, setRole] = useState<'client' | 'artisan' | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (!formData.email || !formData.password) {
      setError('Email et mot de passe obligatoires')
      setIsLoading(false)
      return
    }

    try {
      // 1️⃣ Create user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signUpError) {
        setError(signUpError.message)
        setIsLoading(false)
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
        setIsLoading(false)
        return
      }

      // 4️⃣ Insert client profile (authenticated request)
      const { error: profileError } = await supabase.from('clients').insert({
        id: user.id, // IMPORTANT: must match RLS
        name: formData.name,
        email: formData.email,
      })

      if (profileError) {
        setError(profileError.message)
        setIsLoading(false)
        return
      }

      // 5️⃣ Redirect to dashboard
      router.push('/client-dashboard')

    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de l’inscription')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleSelection = (selectedRole: 'client' | 'artisan') => {
    setRole(selectedRole)
    setError('')

    if (selectedRole === 'artisan') {
      router.push('/signup-artisan')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }
<span className="font-medium">{t('signup.client')}</span>
<p className="text-sm text-gray-600">{t('signup.client.desc')}</p>
</div>
</label>

<label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
  <input
    type="radio"
    name="role"
    value="artisan"
    checked={role === 'artisan'}
    onChange={() => handleRoleSelection('artisan')}
    className="mr-3"
  />
  <div>
    <span className="font-medium">{t('signup.artisan')}</span>
    <p className="text-sm text-gray-600">{t('signup.artisan.desc')}</p>
  </div>
</label>
</div>
</div>

{role === 'client' && (
  <form onSubmit={handleSubmit} className="space-y-6">

    {/* Nom */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t('form.firstName')} *
      </label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="input-field"
        required
      />
    </div>

    {/* Email */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t('login.email')} *
      </label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="input-field"
        required
      />
    </div>

    {/* Mot de passe */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t('login.password')} *
      </label>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        className="input-field"
        required
      />
    </div>

    {/* Confirmation */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t('signup.confirmPassword')} *
      </label>
      <input
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        className="input-field"
        required
      />
    </div>

    {/* Mot de passe oublié */}
    <div className="text-right text-sm">
      <Link href="/reset-password" className="text-blue-600 hover:text-blue-500">
        {t('signup.forgotPassword')}
      </Link>
    </div>

    {/* Erreur */}
    {error && (
      <div className="text-red-600 text-sm">
        {error}
      </div>
    )}

    {/* Bouton */}
    <button
      type="submit"
      disabled={isLoading}
      className="btn-primary w-full"
    >
      {isLoading ? t('common.loading') : t('signup.continue')}
    </button>
  </form>
)}

{role === 'artisan' && (
  <div className="text-center py-4">
    <p className="text-gray-600 mb-4">
      {t('signup.artisanRedirect')}
    </p>
    <div className="animate-pulse">
      <span className="text-blue-600">{t('common.redirecting')}</span>
    </div>
  </div>
)}

{!role && (
  <div className="text-center text-gray-500">
    {t('signup.selectRole')}
  </div>
)}

</div>

<div className="text-center text-sm text-gray-600">
  <Link href="/" className="hover:text-gray-900">
    {t('app.back')}
  </Link>
</div>
</div>
</main>
)
}
