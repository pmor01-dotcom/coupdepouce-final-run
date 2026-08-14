'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '../components/LanguageProvider'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('No verification token provided')
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully')
          
          // Auto-login user by storing user data in localStorage
          if (data.user) {
            const userProfile = {
              id: data.user.id,
              email: data.user.email,
              role: data.user.role?.toLowerCase() || 'client',
              name: data.user.name,
              phone: data.user.phone,
              location: data.user.ville,
              metier: data.user.metier,
              isPaid: data.user.isPaid ?? false,
            }
            localStorage.setItem('user', JSON.stringify(userProfile))
            
            // Redirect to appropriate dashboard based on role
            const dashboard = userProfile.role === 'artisan' 
              ? '/artisan-dashboard' 
              : '/client-dashboard'
            
            // Countdown before redirect
            let count = 3
            const interval = setInterval(() => {
              count -= 1
              setCountdown(count)
              if (count <= 0) {
                clearInterval(interval)
                router.push(dashboard)
              }
            }, 1000)
          } else {
            // Fallback to login if no user data
            let count = 3
            const interval = setInterval(() => {
              count -= 1
              setCountdown(count)
              if (count <= 0) {
                clearInterval(interval)
                router.push('/login?verified=true')
              }
            }, 1000)
          }
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-700">{t('loading') || 'Verifying your email...'}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('verification.success') || 'Email Verified'}
            </h2>
            <p className="text-gray-600 mb-2">{message}</p>
            <p className="text-gray-500 mb-6">
              {t('verification.redirecting') || 'Redirecting to dashboard in'} {countdown} {t('verification.seconds') || 'seconds...'}
            </p>
            <Link
              href="/login"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              {t('login') || 'Go to Login'}
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('verification.failed') || 'Verification Failed'}
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              {t('login') || 'Back to Login'}
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}><p>Loading...</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
