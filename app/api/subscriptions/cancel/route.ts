import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user's subscription from database
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', parseInt(userId))
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    // Stripe functionality disabled - artisans not being charged
    // Skip Stripe cancellation

    // Update subscription in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'CANCELLED',
        auto_renew: false
      })
      .eq('id', subscription.id)

    if (updateError) throw updateError

    // Update user's paid status
    const { error: userError } = await supabase
      .from('users')
      .update({ is_paid: false })
      .eq('id', parseInt(userId))

    if (userError) throw userError

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
