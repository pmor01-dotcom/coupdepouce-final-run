import { NextRequest, NextResponse } from 'next/server'
import EmailService from '../../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const { to, name, planType, amount } = await request.json()

    if (!to || !name || !planType || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: to, name, planType, amount' },
        { status: 400 }
      )
    }

    const success = await EmailService.sendPaymentConfirmationEmail(to, name, planType, amount)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Payment confirmation email sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send payment confirmation email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Payment confirmation email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
