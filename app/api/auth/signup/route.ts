import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

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

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`

    // Send verification email using Resend
    try {
      await resend.emails.send({
        from: 'Coup de Pouce <onboarding@resend.dev>',
        to: email,
        subject: 'Vérifiez votre adresse email',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vérifiez votre email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
              <h2 style="color: #6B8E23; margin-top: 0;">Bienvenue ${name} !</h2>
              <p>Merci de vous être inscrit sur Coup de Pouce.</p>
              <p>Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: #6B8E23; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Vérifier mon email</a>
              </div>
              <p style="font-size: 12px; color: #666;">Ou copiez et collez ce lien dans votre navigateur :</p>
              <p style="font-size: 12px; color: #666; word-break: break-all;">${verificationUrl}</p>
              <p style="font-size: 12px; color: #666; margin-top: 20px;">Ce lien expire dans 24 heures.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
              <p>Si vous n'avez pas créé de compte sur Coup de Pouce, vous pouvez ignorer cet email.</p>
            </div>
          </body>
          </html>
        `,
      })
      console.log('Verification email sent to:', email)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Continue even if email fails - user can still verify via development mode if needed
    }

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      verificationUrl // Keep this for development mode fallback
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
