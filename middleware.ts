import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname

  // 1. If NOT logged in → redirect to login (except if already on login or signup pages)
  const publicPaths = ['/login', '/signup-client', '/signup-artisan']
  const isPublic = publicPaths.includes(pathname)

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 2. If logged in → redirect AWAY from login/signup pages
  if (user && isPublic) {
    const role = user.user_metadata.role

    if (role === 'client') {
      return NextResponse.redirect(new URL('/client-dashboard', req.url))
    }

    if (role === 'artisan') {
      return NextResponse.redirect(new URL('/artisan-dashboard', req.url))
    }
  }

  // 3. If logged in and already on a dashboard, allow access
  return res
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/signup-client',
    '/signup-artisan',
    '/client-dashboard',
    '/artisan-dashboard',
     '/check-email'
  ],
}

