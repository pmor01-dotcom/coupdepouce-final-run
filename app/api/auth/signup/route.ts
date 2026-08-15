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

    console.log('Signup attempt for email:', email, 'role:', role)

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email, email_verified')
      .eq('email', email)
      .single()

    if (existingUser) {
      console.log('User already exists:', email, 'verified:', existingUser.email_verified)
      if (existingUser.email_verified) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
      } else {
        return NextResponse.json({ error: 'An account with this email already exists but is not verified. Please check your email or request a new verification email.' }, { status: 400 })
      }
    }

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
      console.error('User creation error:', userError)
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (req.headers.get('host')?.includes('localhost') ? 'http://localhost:3000' : `https://${req.headers.get('host')}`)
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`

    console.log('=== EMAIL SENDING DEBUG ===')
    console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length)
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL)
    console.log('Recipient email:', email)
    console.log('Verification URL:', verificationUrl)

    // Send verification email using Resend
    let emailSent = false
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured in environment variables')
    } else {
      try {
        console.log('Attempting to send email via Resend...')
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
        const fromName = process.env.RESEND_FROM_NAME || 'Coup de Pouce'
        
        console.log('From email:', fromEmail)
        console.log('From name:', fromName)
        
        const emailResult = await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
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
        console.log('Email sent successfully')
        console.log('Resend response:', JSON.stringify(emailResult, null, 2))
        console.log('Verification email sent to:', email)
        emailSent = true
      } catch (emailError: any) {
        console.error('Failed to send verification email:', emailError)
        console.error('Error details:', JSON.stringify(emailError, null, 2))
      }
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
