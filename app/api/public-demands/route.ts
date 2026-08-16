import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('=== PUBLIC DEMANDS DEBUG ===')

    // First, get all demands with their client IDs
    const { data: demands, error: demandsError } = await supabase
      .from('demands')
      .select('id, title, category, location, description, budget_range, urgency, client_id, status, created_at')
      .eq('status', 'OPEN')
      .order('created_at', { ascending: false })
      .limit(50)

    if (demandsError) {
      console.error('Error fetching public demands:', demandsError)
      return NextResponse.json([], { status: 200 })
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

    // Get all unique client IDs
    const clientIds = [...new Set(demands.map(d => d.client_id))]
    console.log('Unique client IDs:', clientIds)

    // Check which users still exist
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, phone')
      .in('id', clientIds)

    if (usersError) {
      console.error('Error fetching users:', usersError)
    }

    console.log('Existing users found:', existingUsers?.length || 0)
    const existingUserIds = new Set(existingUsers?.map(u => u.id) || [])
    console.log('Existing user IDs:', Array.from(existingUserIds))

    // Filter out demands from deleted users and attach user info
    const demandsWithUsers = demands
      .filter(demand => {
        const exists = existingUserIds.has(demand.client_id)
        if (!exists) {
          console.log('Filtered out demand from deleted user:', demand.id, 'client_id:', demand.client_id)
        } else {
          console.log('Demand passed user validation:', demand.id, 'client_id:', demand.client_id)
        }
        return exists
      })
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
