import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '../../../../lib/prisma'
import EmailService from '../../../../lib/email'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    let event: any

const stripe = getStripe()
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET')
      return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 })
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
     case 'payment_intent.succeeded':
  await handlePaymentSucceeded(event.data.object as any)
  break

        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as any)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as any)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as any)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as any)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as any)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as any)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.userId
  const billingCycle = paymentIntent.metadata.billingCycle

  if (!userId) {
    console.error('No userId found in payment intent metadata')
    return
  }

  try {
    // Create or update subscription in database
    const endDate = new Date()
    if (billingCycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: { user_id: parseInt(userId) }
    })

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'ACTIVE',
          start_date: new Date(),
          end_date: endDate,
          stripe_subscription_id: paymentIntent.id,
          payment_method: 'stripe',
          plan_type: billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY',
        },
      })
    } else {
      await prisma.subscription.create({
        data: {
          user_id: parseInt(userId),
          status: 'ACTIVE',
          start_date: new Date(),
          end_date: endDate,
          stripe_subscription_id: paymentIntent.id,
          payment_method: 'stripe',
          plan_type: billingCycle === 'yearly' ? 'YEARLY' : 'MONTHLY',
        },
      })
    }

    // Update user's paid status
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { is_paid: true },
    })

    // Send payment confirmation email
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (user && user.email) {
      const planTypeText = billingCycle === 'yearly' ? 'Annuel' : 'Mensuel'
      const amountText = billingCycle === 'yearly' ? '200.00' : '20.00'
      
      await EmailService.sendPaymentConfirmationEmail(
        user.email,
        user.name,
        billingCycle,
        amountText
      )
    }

    console.log(`Payment succeeded for user ${userId}, subscription activated`)

  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.userId

  if (!userId) {
    console.error('No userId found in payment intent metadata')
    return
  }

  console.log(`Payment failed for user ${userId}`)
  // You could send a notification email here
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Invoice payment succeeded: ${invoice.id}`)
  // Handle recurring subscription payments
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Invoice payment failed: ${invoice.id}`)
  // Handle failed recurring payments, maybe notify user
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`Subscription created: ${subscription.id}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Subscription updated: ${subscription.id}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Subscription deleted: ${subscription.id}`)
  
  // Update database subscription status
  try {
    // Find subscription by stripe ID
    const dbSubscription = await prisma.subscription.findFirst({
      where: { stripe_subscription_id: subscription.id },
    })

    if (dbSubscription) {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: { status: 'CANCELLED' },
      })

      // Update user's paid status
      await prisma.user.update({
        where: { id: dbSubscription.user_id },
        data: { is_paid: false },
      })
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}
