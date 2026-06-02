'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'

interface SubscriptionStatus {
  plan: 'monthly' | 'yearly'
  status: 'active' | 'expired' | 'cancelled'
  startDate: string
  endDate: string
  amount: number
  currency: string
  autoRenew: boolean
}

export default function PaymentStatus() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.subscription) {
      setSubscription({
        plan: user.subscription.plan,
        status: new Date(user.subscription.endDate) > new Date() ? 'active' : 'expired',
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        amount: user.subscription.plan === 'monthly' ? 29.99 : 299.99,
        currency: 'EUR',
        autoRenew: true
      })
    }
    setIsLoading(false)
  }, [user])

  if (isLoading) {
    return <div className="text-sm text-gray-500">Chargement...</div>
  }

  if (!user || user.role !== 'artisan') {
    return null
  }

  return (
    <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-900 shadow-sm">
      <h3 className="font-semibold text-green-800">{t('payment.freeStatusTitle')}</h3>
      <p className="mt-1 text-green-700">{t('payment.freeStatusSubtitle')}</p>
    </div>
  )
}
