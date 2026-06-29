
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get current session
  const {
    data: { session }
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // Public routes that do NOT require login
  const publicPaths = [
    '/login',
    '/signup',
    '/signup-client',
    '/signup-artisan',
    '/forgot-password',
    '/reset-password',
    '/check-email',
    '/auth/callback'
  ]

  const isPublic = publicPaths.includes(pathname)

  // If NOT logged in → redirect to login (unless on public page)
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If logged in → fetch REAL role from Supabase
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const role = profile?.role

    // If logged in and on login/signup → redirect to correct dashboard
    if (isPublic) {
      if (role === 'client') {
        return NextResponse.redirect(new URL('/client-dashboard', req.url))
      }
      if (role === 'artisan') {
        return NextResponse.redirect(new URL('/artisan-dashboard', req.url))
      }
    }

    // Protect artisan dashboard
    if (pathname.startsWith('/artisan-dashboard') && role !== 'artisan') {
      return NextResponse.redirect(new URL('/client-dashboard', req.url))
    }

    // Protect client dashboard
    if (pathname.startsWith('/client-dashboard') && role !== 'client') {
      return NextResponse.redirect(new URL('/artisan-dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/signup-client',
    '/signup-artisan',
    '/forgot-password',
    '/reset-password',
    '/client-dashboard/:path*',
    '/artisan-dashboard/:path*',
    '/check-email',
    '/auth/callback'
  ]
}
