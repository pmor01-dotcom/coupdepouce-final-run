import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    // 1. Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // 2. Verify password - handle both bcrypt hashes and plain text (legacy)
    let isPasswordValid = false
    const storedHash = user.password_hash

    // Check if stored password is a bcrypt hash (starts with $2a$ or $2b$)
    if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(password, storedHash)
    } else {
      // Legacy: plain text comparison
      isPasswordValid = password === storedHash
      
      // If valid, upgrade to bcrypt hash
      if (isPasswordValid) {
        const newHash = await bcrypt.hash(password, 10)
        await supabase
          .from('users')
          .update({ password_hash: newHash })
          .eq('id', user.id)
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // 3. Check if email is verified
    if (!user.email_verified) {
      return NextResponse.json({ 
        error: 'Please verify your email before logging in',
        requiresVerification: true
      }, { status: 403 })
    }

    // 4. Create session token and save it
    const token = crypto.randomBytes(32).toString('hex')

    const { error: sessionError } = await supabase
      .from('sessions')
      .upsert({
        user_id: user.id,
        token,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (sessionError) {
      console.error('Session creation failed:', sessionError)
      return NextResponse.json({ error: 'Unable to create session' }, { status: 500 })
    }

    // 5. Return user data and the token
    const { password_hash, ...userWithoutPassword } = user

    console.log('Login successful - User ID:', user.id, 'Token created:', !!token)

    return NextResponse.json({
      user: userWithoutPassword,
      token,
      success: true
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
