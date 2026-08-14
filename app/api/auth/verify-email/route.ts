import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Missing verification token' }, { status: 400 })
    }

    // Find user with this token and check if it's not expired
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 })
    }

    // Check if token is expired
    if (user.verification_token_expires && new Date(user.verification_token_expires) < new Date()) {
      return NextResponse.json({ error: 'Verification token has expired' }, { status: 400 })
    }

    // Mark user as verified and clear the token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires: null
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully',
      role: user.role 
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
