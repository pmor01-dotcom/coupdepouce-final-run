import { NextRequest, NextResponse } from 'next/server'
import EmailService from '../../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const { to, name } = await request.json()

    if (!to || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: to, name' },
        { status: 400 }
      )
    }

    const success = await EmailService.sendWelcomeEmail(to, name)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Welcome email sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send welcome email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Welcome email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
