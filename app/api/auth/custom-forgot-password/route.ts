import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import crypto from 'crypto'
import { EmailService } from '@/lib/email'

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

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get() { return '' },
          set() {},
          remove() {}
        }
      }
    )

    // 1️⃣ Fetch all users (Supabase v2 has no email filter)
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Failed to lookup user' },
        { status: 500 }
      )
    }

    // 2️⃣ Filter manually
    const userData = users.users.find(u => u.email === email)

    if (!userData) {
      return NextResponse.json({
        success: true,
        message:
          'If an account with this email exists, a password reset link has been sent.'
      })
    }

    const userId = userData.id
    const userName = userData.user_metadata?.name ?? ''

    // 3️⃣ Generate token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    // 4️⃣ Delete old tokens
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', userId)

    // 5️⃣ Insert new token
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token: resetToken,
        expires_at: expiresAt
      })

    if (tokenError) {
      console.error('Error creating reset token:', tokenError)
      return NextResponse.json(
        { error: 'Failed to create reset token' },
        { status: 500 }
      )
    }

    // 6️⃣ Send email
    const emailSent = await EmailService.sendPasswordResetEmail(
      email,
      userName,
      resetToken
    )

    if (!emailSent) {
      console.error('Failed to send password reset email')
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message:
        'If an account with this email exists, a password reset link has been sent.'
    })

  } catch (error) {
    console.error('Custom forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
