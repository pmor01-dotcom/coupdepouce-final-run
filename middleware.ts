import { NextResponse } from 'next/server'

export function middleware(req) {
  const url = req.nextUrl

  // If Supabase recovery code is present, redirect to reset-password page
  if (url.searchParams.has('code')) {
    url.pathname = '/reset-password'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
