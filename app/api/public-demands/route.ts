import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('demands')
      .select('id, title, category, location, description, budget_range, urgency, client_id, status, users!inner(email, name, phone)')
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching public demands:', error)
      return NextResponse.json([], { status: 200 })
    }

    // Transform data to match expected format
    const demandsWithUsers = (data || []).map((demand: any) => ({
      id: demand.id,
      title: demand.title,
      category: demand.category,
      location: demand.location,
      description: demand.description,
      budget_range: demand.budget_range,
      urgency: demand.urgency,
      client_id: demand.client_id,
      status: demand.status,
      users: demand.users || null
    }))

    return NextResponse.json(demandsWithUsers)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json([], { status: 200 })
  }
}
