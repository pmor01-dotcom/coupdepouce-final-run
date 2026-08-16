'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        if (session) {
          // Get user role from users table (more reliable than metadata)
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const role = profile?.role?.toLowerCase()

          // Store user data in localStorage for AuthProvider
          if (profile && profile.id && profile.email) {
            const userProfile = {
              id: profile.id,
              email: profile.email,
              role: role as 'client' | 'artisan',
              name: profile.name,
              phone: profile.phone,
              location: profile.location,
              metier: profile.metier,
              isPaid: profile.isPaid ?? false,
            }
            localStorage.setItem('user', JSON.stringify(userProfile))
          }

          // Redirect to appropriate dashboard
          if (role === 'artisan') {
            router.push('/artisan-dashboard')
          } else if (role === 'client') {
            router.push('/client-dashboard')
          } else {
            router.push('/')
          }
        } else {
          // No session, redirect to login
          router.push('/login')
        }
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err.message || 'Authentication failed')
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-700 to-green-300">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <p className="text-gray-600">Vérification de votre email...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-700 to-green-300">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="btn-primary px-6 py-2"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return null
}
