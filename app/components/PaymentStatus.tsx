'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'

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

  // Service is now free - no subscription required
  return null
}
