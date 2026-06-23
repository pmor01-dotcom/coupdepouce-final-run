import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() })
  const body = await req.json()

  const { prenom, nom, email, password, city, departement, role } = body

  // 1. Create Supabase auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        prenom,
        nom,
        city,
        departement,
        role,
      },
    },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  const user = authData.user

  // 2. Insert into Supabase users table
  const { error: insertError } = await supabase.from('users').insert({
    id: user?.id,
    name: `${prenom} ${nom}`,
    email,
    role,
    city,
    departement,
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
