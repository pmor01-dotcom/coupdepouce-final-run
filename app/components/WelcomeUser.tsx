'use client'

import { useAuth } from './AuthProvider'

export default function WelcomeUser() {
  const { user } = useAuth()

  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <div className="flex items-baseline">
      <span className="text-7xl font-bold text-gray-900">
        {firstName ? `Bienvenue ${firstName}` : 'Bienvenue'}
      </span>
    </div>
  )
}
