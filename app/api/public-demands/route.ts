import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase
      .from('demandes')
      .select('id, title, category, location')
      .order('created_at', { ascending: false })
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
