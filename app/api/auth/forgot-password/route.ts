import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    console.log('=== FORGOT PASSWORD REQUEST ===')
    console.log('Email:', email)

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single()

    console.log('User lookup result:', user ? 'Found' : 'Not found')
    console.log('User error:', userError)

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      console.log('User not found or error, returning success message for security')
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now

    // Store reset token in database
    console.log('Storing reset token for user ID:', user.id)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires: tokenExpires.toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error storing reset token:', updateError)
      console.error('Error details:', JSON.stringify(updateError, null, 2))
      return NextResponse.json({ error: 'Failed to process request: ' + updateError.message }, { status: 500 })
    }

    // Generate reset URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (req.headers.get('host')?.includes('localhost') ? 'http://localhost:3000' : `https://${req.headers.get('host')}`)
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    console.log('Reset URL:', resetUrl)

    // Send reset email using Resend
    console.log('=== RESEND EMAIL DEBUG ===')
    console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length)
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM)
    console.log('Recipient email:', email)
    console.log('Reset URL:', resetUrl)

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      // Log the reset URL for development/testing
      console.log('Reset URL (email service not configured):', resetUrl)
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      })
    }

    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev'
      const fromName = process.env.RESEND_FROM_NAME || 'Coup de Pouce'

      console.log('Attempting to send email via Resend...')
      console.log('From:', `${fromName} <${fromEmail}>`)
      console.log('To:', email)

      const emailResult = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Réinitialisation du mot de passe</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
              <h2 style="color: #6B8E23; margin-top: 0;">Réinitialisation du mot de passe</h2>
              <p>Bonjour ${user.name},</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #6B8E23; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Réinitialiser mon mot de passe</a>
              </div>
              <p style="font-size: 12px; color: #666;">Ou copiez et collez ce lien dans votre navigateur :</p>
              <p style="font-size: 12px; color: #666; word-break: break-all;">${resetUrl}</p>
              <p style="font-size: 12px; color: #666; margin-top: 20px;">Ce lien expire dans 1 heure.</p>
              <p style="font-size: 12px; color: #666;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            </div>
          </body>
          </html>
        `,
      })

      console.log('=== EMAIL SEND RESULT ===')
      console.log('Email result:', JSON.stringify(emailResult, null, 2))
      console.log('Reset email sent successfully to:', email)
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Réinitialisation du mot de passe</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to bottom, #6B8E23, #D4E4BC); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0;">Coup de Pouce</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 10px;">
              <h2 style="color: #6B8E23; margin-top: 0;">Réinitialisation du mot de passe</h2>
              <p>Bonjour ${user.name},</p>
              <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #6B8E23; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Réinitialiser mon mot de passe</a>
              </div>
              <p style="font-size: 12px; color: #666;">Ou copiez et collez ce lien dans votre navigateur :</p>
              <p style="font-size: 12px; color: #666; word-break: break-all;">${resetUrl}</p>
              <p style="font-size: 12px; color: #666; margin-top: 20px;">Ce lien expire dans 1 heure.</p>
              <p style="font-size: 12px; color: #666;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            </div>
          </body>
          </html>
        `,
      })

      console.log('=== EMAIL SEND RESULT ===')
      console.log('Email result:', JSON.stringify(emailResult, null, 2))
      console.log('Reset email sent successfully to:', email)
    } catch (emailError: any) {
      console.error('=== EMAIL SEND ERROR ===')
      console.error('Error details:', JSON.stringify(emailError, null, 2))
      console.error('Error message:', emailError.message)
      console.error('Error name:', emailError.name)
      console.error('Error stack:', emailError.stack)

      // Log the reset URL as fallback
      console.log('FALLBACK - Reset URL:', resetUrl)

      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent. (Email service error - check console for reset URL)'
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists with this email, a password reset link has been sent.' 
    })
  } catch (err: any) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
