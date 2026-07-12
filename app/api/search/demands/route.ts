import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category')
    const department = searchParams.get('department')
    const location = searchParams.get('location')
    const budgetRange = searchParams.get('budgetRange')
    const urgency = searchParams.get('urgency')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build Supabase query
    let supabaseQuery = supabase
      .from('demands')
      .select(`
        *,
        client:users!demands_client_id_fkey (
          id,
          name,
          location
        )
      `, { count: 'exact' })

    // Text search
    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%,department.ilike.%${query}%,category.ilike.%${query}%`)
    }

    // Category filter
    if (category) {
      supabaseQuery = supabaseQuery.ilike('category', `%${category}%`)
    }

    // Department filter
    if (department) {
      supabaseQuery = supabaseQuery.ilike('department', `%${department}%`)
    }

    // Location filter
    if (location) {
      supabaseQuery = supabaseQuery.ilike('location', `%${location}%`)
    }

    // Budget filter
    if (budgetRange) {
      supabaseQuery = supabaseQuery.ilike('budget_range', `%${budgetRange}%`)
    }

    // Urgency filter
    if (urgency) {
      supabaseQuery = supabaseQuery.eq('urgency', urgency)
    }

    // Status filter
    if (status) {
      supabaseQuery = supabaseQuery.eq('status', status)
    }

    // Sorting
    const ascending = sortOrder === 'asc'
    supabaseQuery = supabaseQuery.order(sortBy, { ascending })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    supabaseQuery = supabaseQuery.range(from, to)

    const { data: demands, error, count } = await supabaseQuery

    if (error) throw error

    const processedDemands = demands?.map(demand => ({
      id: demand.id,
      title: demand.title,
      description: demand.description,
      category: demand.category,
      location: demand.location,
      department: demand.department,
      budget_range: demand.budget_range,
      urgency: demand.urgency,
      status: demand.status,
      created_at: demand.created_at,
      client: demand.client,
      totalProposals: 0,
      pendingProposals: 0,
      hasValidProposals: false,
      recentProposals: [],
      urgency_level: demand.urgency === 'HIGH' ? 3 : demand.urgency === 'MEDIUM' ? 2 : 1
    })) || []

    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        demands: processedDemands,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount: count || 0,
          hasNextPage,
          hasPreviousPage,
          limit
        },
        filters: {
          query,
          category,
          department,
          location,
          budgetRange,
          urgency,
          status,
          sortBy,
          sortOrder
        }
      }
    })

  } catch (error) {
    console.error('Search demands error:', error)
    return NextResponse.json(
      { error: 'Failed to search demands' },
      { status: 500 }
    )
  }
}
