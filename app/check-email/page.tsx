'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function CheckEmailPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user } = useAuth()

  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // If user is already logged in → redirect
    if (user) {
      router.push('/client-dashboard')
      return
    }

    // Otherwise stop loading
    setChecking(false)
  }, [user, router])

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Checking your email…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        <p className="text-gray-700">
          We’ve sent you a confirmation link. Please check your inbox.
        </p>
      </div>
    </main>
  )
}
