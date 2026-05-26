import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user's subscription from database
    const subscription = await prisma.subscription.findFirst({
      where: { user_id: parseInt(userId) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            is_paid: true
          }
        }
      }
    })

    if (!subscription) {
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
