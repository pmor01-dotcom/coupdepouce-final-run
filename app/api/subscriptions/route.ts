import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Mock subscription lookup - in production, query database
    const subscription = await getUserSubscription(userId)

    return NextResponse.json({
      success: true,
      subscription
    })

  } catch (error) {
    console.error('Subscription lookup error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const subscriptionData = await request.json()

    // Validate required fields
    const { userId, plan, paymentId } = subscriptionData

    if (!userId || !plan || !paymentId) {
      return NextResponse.json(
        { success: false, message: 'Données d\'abonnement invalides' },
        { status: 400 }
      )
    }

    // Create subscription - in production, save to database
    const subscription = await createSubscription(subscriptionData)

    return NextResponse.json({
      success: true,
      message: 'Abonnement créé avec succès',
      subscription
    })

  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création de l\'abonnement' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscriptionId')
    const updateData = await request.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, message: 'ID d\'abonnement requis' },
        { status: 400 }
      )
    }

    // Update subscription - in production, update database
    const subscription = await updateSubscription(subscriptionId, updateData)

    return NextResponse.json({
      success: true,
      message: 'Abonnement mis à jour avec succès',
      subscription
    })

  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour de l\'abonnement' },
      { status: 500 }
    )
  }
}

async function getUserSubscription(userId: string) {
  // Mock implementation - in production, query database
  return {
    id: 'sub_' + Math.random().toString(36).substr(2, 9),
    userId,
    plan: 'monthly',
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 29.99,
    currency: 'EUR',
    autoRenew: true,
    paymentMethod: 'card'
  }
}

async function createSubscription(data: any) {
  // Mock implementation - in production, save to database
  const now = new Date()
  const endDate = new Date(now.getTime() + (data.plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)

  return {
    id: 'sub_' + Math.random().toString(36).substr(2, 9),
    userId: data.userId,
    plan: data.plan,
    status: 'active',
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    amount: data.plan === 'yearly' ? 299.99 : 29.99,
    currency: 'EUR',
    autoRenew: true,
    paymentMethod: 'card',
    paymentId: data.paymentId,
    createdAt: now.toISOString()
  }
}

async function updateSubscription(subscriptionId: string, updateData: any) {
  // Mock implementation - in production, update database
  return {
    id: subscriptionId,
    ...updateData,
    updatedAt: new Date().toISOString()
  }
}
