import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
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

    // 1️⃣ Validate token
    const { data: tokenRow, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tokenError || !tokenRow) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check expiration
    if (new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    const userId = tokenRow.user_id

    // 2️⃣ Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    // 3️⃣ Update password hash in your DB (clients or artisans)
    const { data: userData } = await supabase
      .from('auth.users')
      .select('raw_user_meta_data')
      .eq('id', userId)
      .single()

    const role = userData?.raw_user_meta_data?.role
    const table = role === 'artisan' ? 'artisans' : 'clients'

    const password_hash = await bcrypt.hash(newPassword, 10)

    await supabase
      .from(table)
      .update({ password_hash })
      .eq('id', userId)

    // 4️⃣ Delete used token
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('token', token)

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
