import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1️⃣ Fetch all users (Supabase v2)
    const { data: usersPage, error: listError } =
      await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Failed to lookup user' },
        { status: 500 }
      )
    }

    // 2️⃣ Extract users safely (handles all Supabase v2 shapes)
    const allUsers =
      Array.isArray(usersPage)
        ? usersPage
        : Array.isArray(usersPage?.users)
          ? usersPage.users
          : []

    console.log("Extracted users:", allUsers)

    // 3️⃣ Find user by email
    const userData = allUsers.find(u => u.email === email)

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 4️⃣ Create a reset token
    const { data: resetData, error: resetError } =
      await supabase.auth.admin.generateResetPasswordForEmail(email)

    if (resetError) {
      console.error('Error generating reset token:', resetError)
      return NextResponse.json(
        { error: 'Failed to generate reset token' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Reset email sent', data: resetData },
      { status: 200 }
    )

  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    )
  }
}
