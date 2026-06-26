'use client'

import { useAuth } from './AuthProvider'

export default function WelcomeUser() {
  const { user } = useAuth()

  // Extract first name safely
  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <div className="flex items-center space-x-2 text-3xl font-semibold text-gray-900">
      <span>Bienvenue</span>
      {firstName && <span>{firstName}</span>}
    </div>
  )
}
