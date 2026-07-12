import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/reset-password'

  if (!code) {
    return NextResponse.redirect(new URL('/forgot-password', request.url))
  }

  // Redirect to the reset-password page with the code
  const resetUrl = new URL('/reset-password', request.url)
  resetUrl.searchParams.set('code', code)
  
  return NextResponse.redirect(resetUrl)
}
