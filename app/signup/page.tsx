'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type SignupRole = null | 'client' | 'artisan'

export default function SignupPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<SignupRole>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (selectedRole && !isRedirecting) {
      setIsRedirecting(true)
      if (selectedRole === 'client') {
        router.push('/signup-client')
      } else if (selectedRole === 'artisan') {
        router.push('/signup-artisan')
      }
    }
  }, [selectedRole, isRedirecting, router])

  // Show role selection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-700 to-green-300">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Create an account
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Choose your account type to get started
        </p>

        <div className="space-y-4">
          <Link
            href="/signup-client"
            className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left block"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Client</h3>
                <p className="text-sm text-gray-600">Find artisans for your projects</p>
              </div>
            </div>
          </Link>

          <Link
            href="/signup-artisan"
            className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left block"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Artisan</h3>
                <p className="text-sm text-gray-600">Offer your services to clients</p>
              </div>
            </div>
          </Link>
        </div>

        <p className="text-center text-gray-600 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
