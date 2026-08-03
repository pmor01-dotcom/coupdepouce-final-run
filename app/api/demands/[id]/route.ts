import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const demandId = params.id

    const { data: demand, error } = await supabase
      .from('demands')
      .select(`
        id,
        title,
        description,
        category,
        location,
        department,
        budget_range,
        status,
        created_at,
        client_id,
        users!demands_client_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('id', demandId)
      .single()

    if (error) {
      console.error('Error fetching demand:', error)
      return NextResponse.json(
        { error: 'Demand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(demand)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
