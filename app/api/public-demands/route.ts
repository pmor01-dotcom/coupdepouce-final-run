import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('=== PUBLIC DEMANDS DEBUG ===')

    const { data: demands, error: demandsError } = await supabase
      .from('demands')
      .select(`
        id,
        title,
        category,
        location,
        description,
        budget_range,
        urgency,
        client_id,
        status,
        created_at,
        users!demands_client_id_fkey (
          id,
          email,
          name,
          phone
        )
      `)
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false })
      .limit(50)

    if (demandsError) {
      console.error('Error fetching public demands:', demandsError)
      return NextResponse.json({ error: 'Failed to fetch public demands' }, { status: 500 })
    }

    console.log('Total OPEN demands found:', demands?.length || 0)
    if (demands && demands.length > 0) {
      console.log('Sample demand:', JSON.stringify(demands[0], null, 2))
      console.log('All demand IDs:', demands.map(d => d.id))
    }

    if (!demands || demands.length === 0) {
      console.log('No OPEN demands found in database')
      return NextResponse.json([])
    }

    return NextResponse.json(demands)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json([], { status: 200 })
  }
}
