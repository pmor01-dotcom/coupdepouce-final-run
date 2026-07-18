import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('demands')
      .select('id, title, category, location')
      .limit(20)

    if (error) {
      console.error('Error fetching public demands:', error)
      return NextResponse.json({ error: 'Failed to load demands' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
