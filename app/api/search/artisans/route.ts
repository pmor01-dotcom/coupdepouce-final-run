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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build Supabase query
    let supabaseQuery = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('role', 'ARTISAN')

    // Text search
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,metier.ilike.%${query}%,location.ilike.%${query}%,department.ilike.%${query}%`)
    }

    // Category filter
    if (category) {
      supabaseQuery = supabaseQuery.ilike('metier', `%${category}%`)
    }

    // Department filter
    if (department) {
      supabaseQuery = supabaseQuery.ilike('department', `%${department}%`)
    }

    // Location filter
    if (location) {
      supabaseQuery = supabaseQuery.ilike('location', `%${location}%`)
    }

    // Sorting
    const ascending = sortOrder === 'asc'
    supabaseQuery = supabaseQuery.order(sortBy, { ascending })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    supabaseQuery = supabaseQuery.range(from, to)

    const { data: artisans, error, count } = await supabaseQuery

    if (error) throw error

    const artisansWithRatings = artisans?.map(artisan => ({
      id: artisan.id,
      name: artisan.name,
      metier: artisan.metier,
      location: artisan.location,
      department: artisan.department,
      experience_years: artisan.experience_years,
      insurance_number: artisan.insurance_number,
      work_hours: artisan.work_hours,
      business_address: artisan.business_address,
      company_name: artisan.company_name,
      phone: artisan.phone,
      created_at: artisan.created_at,
      averageRating: 0,
      totalReviews: 0,
      totalProposals: 0,
      recentProposals: [],
      hasInsurance: !!artisan.insurance_number,
      isAvailable: !!artisan.work_hours
    })) || []

    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        artisans: artisansWithRatings,
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
          sortBy,
          sortOrder
        }
      }
    })

  } catch (error) {
    console.error('Search artisans error:', error)
    return NextResponse.json(
      { error: 'Failed to search artisans' },
      { status: 500 }
    )
  }
}
