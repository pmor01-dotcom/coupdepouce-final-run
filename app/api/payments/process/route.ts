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
      const { paymentIntentId, userId, billingCycle } = await request.json().catch(() => ({}))
      const mockId = `free-${Date.now()}`
      const transaction = {
        id: mockId,
        amount: 0,
        currency: 'EUR',
        billingCycle: billingCycle || 'monthly',
        status: 'completed',
        paymentMethod: 'free-mode',
        stripePaymentIntentId: mockId,
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        message: 'Free-site mode: payment simulated',
        paymentId: mockId,
        transaction,
      })
    }
    const { paymentIntentId, userId, billingCycle } = await request.json()

    if (!paymentIntentId || !userId) {
      return NextResponse.json(
        { success: false, message: 'Payment intent ID and user ID are required' },
        { status: 400 }
      )
    }

    // Retrieve the payment intent from Stripe
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { success: false, message: 'Payment not successful' },
        { status: 400 }
      )
    }

    // Create transaction record
    const transaction = {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      billingCycle: billingCycle || 'monthly',
      status: 'completed',
      paymentMethod: 'stripe',
      stripePaymentIntentId: paymentIntent.id,
      createdAt: new Date(paymentIntent.created * 1000).toISOString(),
      processedAt: new Date().toISOString()
    }

    console.log('Payment processed successfully:', transaction)

    return NextResponse.json({
      success: true,
      message: 'Paiement traité avec succès',
      paymentId: paymentIntent.id,
      transaction
    })

  } catch (error) {
    console.error('Stripe payment processing error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors du traitement du paiement' },
      { status: 500 }
    )
  }
}
