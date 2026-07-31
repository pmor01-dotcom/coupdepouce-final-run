import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    // 1. Read user ID from header (sent by frontend)
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
    }

    // 2. Fetch user basic info
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    // 3. Fetch artisan profile info
    const { data: profileRow, error: profileError } = await supabase
      .from('artisan_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // 4. Merge both tables
    const merged = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      phone: profileRow.phone,
      location: profileRow.city,
      metier: profileRow.trade,
      description: profileRow.description,
      experience_years: profileRow.experience_years,
      specialties: profileRow.specialties,
      photo_url: profileRow.photo_url
    }

    return NextResponse.json(merged)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
