import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  console.log('=== SIGNUP ROUTE HIT ===')

  try {
    const body = await req.json()
    const { name, email, password, role, ville, metier, phone } = body

    // Hash password before storing
    const password_hash = await bcrypt.hash(password, 10)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password_hash,
        role,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expires: tokenExpires.toISOString()
      })
      .select()
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    console.log("Signup successful - User ID:", user.id, "Type:", typeof user.id)

    if (role === 'artisan' || role === 'ARTISAN') {
      const profileData = {
        id: user.id,
        trade: metier,
        city: ville,
        phone: phone,
        experience_years: null,
        specialties: null,
        description: null
      }

      const { error: profileError } = await supabase
        .from('artisan_profiles')
        .insert(profileData)

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 })
      }
    }

    // In a real implementation, you would send an email here
    // For now, we'll return the verification URL so the user can manually verify
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      verificationUrl // Remove this in production when email is implemented
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
