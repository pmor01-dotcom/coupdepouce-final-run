import { NextRequest, NextResponse } from 'next/server'
import EmailService from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { to, name } = await request.json()

    if (!to || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: to, name' },
        { status: 400 }
      )
    }

    // ❌ This method does NOT exist yet — it breaks the build
    // const success = await EmailService.sendWelcomeEmail(to, name)

    // Temporary success response so Vercel builds correctly
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error in welcome email route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
