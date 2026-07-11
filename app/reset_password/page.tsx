'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function ResetPasswordPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      supabase.auth.exchangeCodeForSession(token)
    }
  }, [])

  async function handleSubmit(e: any) {
    e.preventDefault()

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage('Erreur lors de la mise à jour du mot de passe')
    } else {
      setMessage('Mot de passe mis à jour avec succès')
    }
  }

  return (
    <div>
      <h1>Réinitialiser votre mot de passe</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Mettre à jour</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  )
}
