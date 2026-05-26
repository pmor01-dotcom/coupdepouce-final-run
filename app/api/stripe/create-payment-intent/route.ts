import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
}

export async function POST(request: NextRequest) {
  try {
    if (process.env.FREE_SITE === 'true') {
      // In free mode return a mock clientSecret and paymentIntentId so front-end can proceed
      const mockId = `free-${Date.now()}`
      return NextResponse.json({ clientSecret: `free-secret-${mockId}`, paymentIntentId: mockId })
    }

    const { amount, currency = 'eur', billingCycle, userId } = await request.json()

    if (!amount || !userId) {
      return NextResponse.json(
        { error: 'Amount and user ID are required' },
        { status: 400 }
      )
    }

    // Convert amount to cents (Stripe uses cents)
    const amountInCents = Math.round(amount * 100)

    // Create payment intent
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: {
        userId: userId.toString(),
        billingCycle: billingCycle || 'monthly',
        type: 'subscription'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })

  } catch (error) {
    console.error('Stripe payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
