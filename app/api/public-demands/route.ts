import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First, get all demands with their client IDs
    const { data: demands, error: demandsError } = await supabase
      .from('demands')
      .select('id, title, category, location, description, budget_range, urgency, client_id, status')
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false })
      .limit(50)

    if (demandsError) {
      console.error('Error fetching public demands:', demandsError)
      return NextResponse.json([], { status: 200 })
    }

    if (!demands || demands.length === 0) {
      return NextResponse.json([])
    }

    // Get all unique client IDs
    const clientIds = [...new Set(demands.map(d => d.client_id))]

    // Check which users still exist
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, phone')
      .in('id', clientIds)

    if (usersError) {
      console.error('Error fetching users:', usersError)
    }

    const existingUserIds = new Set(existingUsers?.map(u => u.id) || [])

    // Filter out demands from deleted users and attach user info
    const demandsWithUsers = demands
      .filter(demand => existingUserIds.has(demand.client_id))
      .map((demand: any) => {
        const userData = existingUsers?.find(u => u.id === demand.client_id)
        return {
          id: demand.id,
          title: demand.title,
          category: demand.category,
          location: demand.location,
          description: demand.description,
          budget_range: demand.budget_range,
          urgency: demand.urgency,
          client_id: demand.client_id,
          status: demand.status,
          users: userData || null
        }
      })

    console.log(`Filtered demands: ${demandsWithUsers.length} out of ${demands.length} (removed ${demands.length - demandsWithUsers.length} from deleted users)`)

    return NextResponse.json(demandsWithUsers)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json([], { status: 200 })
  }
}
