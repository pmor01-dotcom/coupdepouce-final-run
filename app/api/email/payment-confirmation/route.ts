import { NextRequest, NextResponse } from 'next/server'
import EmailService from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { to, name, planType, amount } = await request.json()

    if (!to || !name || !planType || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: to, name, planType, amount' },
        { status: 400 }
      )
    }

    // ⚠️ IMPORTANT:
    // If sendPaymentConfirmationEmail does NOT exist yet,
    // comment this out until you implement it.
    // const success = await EmailService.sendPaymentConfirmationEmail({
    //   to,
    //   name,
    //   planType,
    //   amount,
    // })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error in payment confirmation route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
