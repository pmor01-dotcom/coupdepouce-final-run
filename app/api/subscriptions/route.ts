import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      success: true,
      subscription: subscription || null
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

    const { userId, plan, paymentId } = subscriptionData

    if (!userId || !plan || !paymentId) {
      return NextResponse.json(
        { success: false, message: 'Données d\'abonnement invalides' },
        { status: 400 }
      )
    }

    const now = new Date()
    const endDate = new Date(now.getTime() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
    const amount = plan === 'yearly' ? 299.99 : 29.99

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan,
        status: 'active',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        amount,
        currency: 'EUR',
        auto_renew: true,
        payment_method: 'card',
        payment_id: paymentId
      })
      .select()
      .single()

    if (error) throw error

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

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) throw error

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
