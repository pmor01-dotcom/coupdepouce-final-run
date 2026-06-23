import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user's subscription from database
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        user:users!subscriptions_user_id_fkey (
          id,
          email,
          name,
          is_paid
        )
      `)
      .eq('user_id', parseInt(userId))
      .single()

    if (subError || !subscription) {
      return NextResponse.json({
        subscription: null,
        user: {
          id: parseInt(userId),
          is_paid: false
        }
      })
    }

    // Check if subscription is still valid
    const now = new Date()
    const endDate = new Date(subscription.end_date)
    const isActive = subscription.status === 'ACTIVE' && now <= endDate

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan_type: subscription.plan_type,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        auto_renew: subscription.auto_renew,
        is_active: isActive,
        days_left: Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      },
      user: subscription.user
    })

  } catch (error) {
    console.error('Get subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
