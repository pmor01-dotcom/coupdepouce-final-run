'use client'

import { useAuth } from '@/app/components/AuthProvider'

export default function PaymentStatus() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <p className="text-gray-700">
        Statut du paiement :{' '}
        {user.isPaid ? (
          <span className="text-green-600 font-semibold">Actif</span>
        ) : (
          <span className="text-red-600 font-semibold">Non payé</span>
        )}
      </p>
    </div>
  )
}