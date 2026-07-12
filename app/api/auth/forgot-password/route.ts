'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useLanguage } from '../components/LanguageProvider'

export default function ForgotPassword() {
  const { t } = useLanguage()
  const supabase = createClientComponentClient()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.coupdepouce-aide.com/reset-password'
    })

    setLoading(false)

    if (error) {
      setError(t('forgotPassword.genericError'))
      return
    }

    setMessage(t('forgotPassword.emailSent'))
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">{t('forgotPassword.title')}</h1>

        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <input
          type="email"
          className="w-full p-3 border rounded mb-4"
          placeholder={t('forgotPassword.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white p-3 rounded"
        >
          {loading ? t('forgotPassword.sending') : t('forgotPassword.submit')}
        </button>

        <div className="text-center mt-4">
          <a href="/login" className="text-green-700 hover:underline">
            {t('forgotPassword.backToLogin')}
          </a>
        </div>
      </form>
    </main>
  )
}
