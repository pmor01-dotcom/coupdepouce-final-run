import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Use Supabase's built-in password reset
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
      || process.env.APP_URL
      || new URL(request.url).origin
      || 'http://localhost:3000'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`
    })

    if (error) {
      console.error('Password reset error:', error)
      // Security: still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
