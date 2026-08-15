import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password } = body

    console.log('=== RESET PASSWORD REQUEST ===')
    console.log('Token present:', !!token)
    console.log('Password present:', !!password)

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 })
    }

    // Find user with this reset token
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .single()

    if (error || !user) {
      console.error('Invalid or expired reset token')
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Check if token is expired
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      console.error('Reset token has expired')
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 })
    }

    // Hash new password
    const password_hash = await bcrypt.hash(password, 10)

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash,
        reset_token: null,
        reset_token_expires: null
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    console.log('Password updated successfully for user:', user.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully',
      role: user.role
    })
  } catch (err: any) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
