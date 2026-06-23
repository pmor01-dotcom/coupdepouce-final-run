import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import EmailService from '../../../../lib/email'
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry
      }
    })

    // Send password reset email
    const emailSent = await EmailService.sendPasswordResetEmail(
      email,
      user.name,
      resetToken
    )

    if (emailSent) {
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
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
