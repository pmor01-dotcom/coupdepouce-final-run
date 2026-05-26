import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '../../../../lib/prisma'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user's subscription from database
    const subscription = await prisma.subscription.findFirst({
      where: { user_id: parseInt(userId) }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // If subscription has Stripe ID, cancel it in Stripe
    if (subscription.stripe_subscription_id) {
      try {
        const stripe = getStripe()
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError)
        // Continue with database update even if Stripe cancellation fails
      }
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        auto_renew: false
      }
    })

    // Update user's paid status
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { is_paid: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully'
    })

  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
