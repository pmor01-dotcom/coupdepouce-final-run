'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../components/AuthProvider'

export default function CheckEmailPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { user, isLoading } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkEmailVerification = async () => {
      // Wait for auth state to load
      if (isLoading) {
        return
      }

      // If user is already verified and logged in, redirect to appropriate dashboard
      if (user) {
        if (user.role === 'client') {
          router.push('/client-dashboard')
        } else if (user.role === 'artisan') {
          router.push('/artisan-dashboard')
        } else {
          // Default to client dashboard if role is not set
          router.push('/client-dashboard')
        }
        return
      }

      // If no user session, they need to verify their email first
      // Poll for session changes (user clicking email verification link)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Get role from users table
          const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

          const role = profile?.role?.toLowerCase()

          if (role === 'client') {
            router.push('/client-dashboard')
          } else if (role === 'artisan') {
            router.push('/artisan-dashboard')
          } else {
            router.push('/client-dashboard')
          }
        }
      })

      setChecking(false)

      return () => {
        subscription.unsubscribe()
      }
    }

    checkEmailVerification()
  }, [user, isLoading, router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-700 to-green-200 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Check your email
        </h1>

        <p className="text-gray-600 mb-6">
          We have sent a confirmation link to your email address. 
          Click the link to activate your account.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          After verifying your email, you will be automatically redirected to your dashboard.
        </p>

        {checking && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Didn't receive an email? Check your spam folder or{' '}
            <button
              onClick={() => router.back()}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
