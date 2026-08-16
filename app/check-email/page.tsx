'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '../components/LanguageProvider'

export const dynamic = 'force-dynamic'

function CheckEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [verificationUrl, setVerificationUrl] = useState('')

  useEffect(() => {
    const url = searchParams.get('token')
    if (url) {
      setVerificationUrl(url)
    }
  }, [searchParams])

  const handleVerifyClick = () => {
    if (verificationUrl) {
      window.location.href = verificationUrl
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
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
          {t('verification.checkEmail') || 'Check your email'}
        </h1>

        <p className="text-gray-600 mb-6">
          {t('verification.emailSent') || 'A verification email has been sent to your address.'}
        </p>

        <p className="text-sm text-gray-500 mb-6">
          {t('verification.required') || 'Please verify your email before logging in.'}
        </p>

        {/* Show verification URL for testing if email doesn't arrive */}
        {verificationUrl && typeof window !== 'undefined' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 mb-2 font-semibold">
              {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'Development Mode - Manual Verification'
                : 'If you did not receive the email, you can verify manually:'}
            </p>
            <p className="text-xs text-gray-600 mb-2 break-all">
              {verificationUrl}
            </p>
            <button
              onClick={handleVerifyClick}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Click to verify
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push('/login')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            {t('login') || 'Back to Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}><p>Loading...</p></div>}>
      <CheckEmailContent />
    </Suspense>
  )
}
