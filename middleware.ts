import { NextResponse } from 'next/server'

export function middleware(req) {
  // Middleware is now disabled for custom password reset flow
  return NextResponse.next()
}
