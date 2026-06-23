import { NextRequest, NextResponse } from 'next/server'
import EmailService from '../../../lib/email'


export async function POST(request: NextRequest) {
  try {
    const { to, name, resetToken } = await request.json()

    if (!to || !name || !resetToken) {
      return NextResponse.json(
        { error: 'Missing required fields: to, name, resetToken' },
        { status: 400 }
      )
    }

    const success = await EmailService.sendPasswordResetEmail(to, name, resetToken)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Password reset email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
