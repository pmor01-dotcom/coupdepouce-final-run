'use client'

import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'

export default function WelcomeUser() {
  const { user } = useAuth()
  const { t } = useLanguage()

  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <div className="flex items-baseline">
      <span className="text-7xl font-bold text-gray-900">
        {firstName ? `${t('common.welcome')} ${firstName}` : t('common.welcome')}
      </span>
    </div>
  )
}