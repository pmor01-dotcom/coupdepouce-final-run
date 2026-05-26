'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useLanguage } from '../components/LanguageProvider'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormData {
  billingAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
}

function PaymentForm({ billingCycle, amount }: { billingCycle: 'monthly' | 'yearly', amount: number }) {
  const router = useRouter()
  const { t } = useLanguage()
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<PaymentFormData>({
    billingAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    }
  })

  const pricing = {
    monthly: 20.00,
    yearly: 200.00,
    currency: '\u20AC'
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!stripe || !elements) {
      setError('Stripe n\'est pas encore chargé')
      setIsLoading(false)
      return
    }

    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = userData.id

      if (!userId) {
        throw new Error('Utilisateur non connecté')
      }

      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'eur',
          billingCycle: billingCycle,
          userId: userId
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement')
      }

      const { clientSecret, paymentIntentId } = await response.json()

      // Confirm payment with Stripe Elements
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
          payment_method_data: {
            billing_details: {
              address: {
                line1: formData.billingAddress.street,
                city: formData.billingAddress.city,
                postal_code: formData.billingAddress.postalCode,
                country: formData.billingAddress.country,
              },
            },
          },
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message || 'Erreur lors du paiement')
      }

      // Payment successful
      setSuccess(true)
      setTimeout(() => {
        router.push('/artisan-dashboard')
      }, 3000)

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du paiement')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
        <div className="max-w-md w-full">
          <div className="card text-center p-8">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi!</h2>
              <p className="text-gray-600 mb-4">
                Votre abonnement a été activé avec succès.
              </p>
              <p className="text-sm text-gray-500">
                Vous allez être redirigé vers votre tableau de bord...
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {t('payment.cardInfo')}
      </h3>
      
      {/* Selected Plan Summary */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              {t('payment.planSelected')}:
            </p>
            <p className="text-lg font-bold text-green-900">
              {billingCycle === 'monthly' ? t('payment.monthly') : t('payment.yearly')} - {amount} {pricing.currency}
            </p>
          </div>
          <div className="text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Stripe Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Informations de carte
          </label>
          <div className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('payment.billing')}
          </label>
          <input
            type="text"
            value={formData.billingAddress.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            placeholder={t('payment.streetPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('payment.city')}
            </label>
            <input
              type="text"
              value={formData.billingAddress.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              placeholder={t('payment.cityPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('payment.postal')}
            </label>
            <input
              type="text"
              value={formData.billingAddress.postalCode}
              onChange={(e) => handleAddressChange('postalCode', e.target.value)}
              placeholder={t('payment.postalPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('payment.country')}
          </label>
          <select
            value={formData.billingAddress.country}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="France">France</option>
            <option value="Belgique">Belgique</option>
            <option value="Suisse">Suisse</option>
            <option value="Luxembourg">Luxembourg</option>
          </select>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">
              {t('payment.subscription')} {billingCycle === 'monthly' ? t('payment.monthly').toLowerCase() : t('payment.yearly').toLowerCase()}
            </span>
            <span className="font-semibold">
              {amount} {pricing.currency}
            </span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>{t('payment.total')}</span>
            <span>{amount} {pricing.currency}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !stripe}
          className="w-full btn-success disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('payment.processing') : `${t('payment.pay')} ${amount} ${pricing.currency}`}
        </button>

        <div className="text-xs text-gray-500 text-center">
          <p>{t('payment.terms')}</p>
          <p className="mt-1">{t('payment.secure')}</p>
        </div>
      </form>
    </div>
  )
}

export default function PaymentPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const pricing = {
    monthly: 20.00,
    yearly: 200.00,
    currency: '\u20AC'
  }

  const amount = billingCycle === 'monthly' ? pricing.monthly : pricing.yearly

  useEffect(() => {
    // Check if user completed artisan signup
    const artisanData = localStorage.getItem('artisanSignupData')
    if (!artisanData) {
      router.push('/signup-artisan')
      return
    }
  }, [router])

  return (
    <Elements stripe={stripePromise}>
      <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to bottom, #6B8E23, #D4E4BC)' }}>
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('payment.title')}
            </h2>
            <p className="text-gray-600">
              {t('payment.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Pricing Section */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('payment.chooseSubscription')}
              </h3>
              
              <div className="space-y-4">
                {/* Monthly Button */}
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`w-full p-4 rounded-full border-2 transition-all ${
                    billingCycle === 'monthly' 
                      ? 'border-green-500 bg-green-50 shadow-lg' 
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      {t('payment.monthlySubscription')}
                    </h4>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {pricing.monthly} {pricing.currency}
                    </div>
                    <p className="text-xs text-gray-600">
                      {t('payment.billedMonthly')}
                    </p>
                  </div>
                </button>

                {/* Yearly Button */}
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`w-full p-4 rounded-full border-2 transition-all ${
                    billingCycle === 'yearly' 
                      ? 'border-green-500 bg-green-50 shadow-lg' 
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">
                      {t('payment.yearlySubscription')}
                    </h4>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {pricing.yearly} {pricing.currency}
                    </div>
                    <p className="text-xs text-gray-600">
                      {t('payment.save')} 40 {pricing.currency} {t('payment.perYear')}
                    </p>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{t('payment.included')}</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>{t('payment.unlimited')}</li>
                  <li>{t('payment.verified')}</li>
                  <li>{t('payment.stats')}</li>
                  <li>{t('payment.support')}</li>
                  <li>{t('payment.noCommitment')}</li>
                </ul>
              </div>
            </div>

            {/* Payment Form */}
            <PaymentForm billingCycle={billingCycle} amount={amount} />
          </div>

          <div className="text-center mt-6">
            <Link href="/signup-artisan" className="text-gray-600 hover:text-gray-900">
              Retour à l'inscription
            </Link>
          </div>
        </div>
      </main>
    </Elements>
  )
}
