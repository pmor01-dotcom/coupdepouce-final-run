import { NextRequest, NextResponse } from 'next/server'


export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract search parameters
    const query = searchParams.get('query') || ''
    const category = searchParams.get('category')
    const department = searchParams.get('department')
    const location = searchParams.get('location')
    const minExperience = searchParams.get('minExperience')
    const maxExperience = searchParams.get('maxExperience')
    const hasInsurance = searchParams.get('hasInsurance')
    const isAvailable = searchParams.get('isAvailable')
    const minRating = searchParams.get('minRating')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause for filtering
    const whereClause: any = {
      role: 'ARTISAN'
      // is_paid check removed - service is free for now
    }

    // Text search across multiple fields
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { metier: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
        { department: { contains: query, mode: 'insensitive' } },
        { business_address: { contains: query, mode: 'insensitive' } },
        { company_name: { contains: query, mode: 'insensitive' } }
      ]
    }

    // Category filter
    if (category) {
      whereClause.metier = { contains: category, mode: 'insensitive' }
    }

    // Location filters
    if (department) {
      whereClause.department = { contains: department, mode: 'insensitive' }
    }
    
    if (location) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { location: { contains: location, mode: 'insensitive' } },
        { business_address: { contains: location, mode: 'insensitive' } }
      ]
    }

    // Experience filters
    if (minExperience || maxExperience) {
      whereClause.experience_years = {}
      if (minExperience) {
        whereClause.experience_years.gte = parseInt(minExperience)
      }
      if (maxExperience) {
        whereClause.experience_years.lte = parseInt(maxExperience)
      }
    }

    // Insurance filter
    if (hasInsurance === 'true') {
      whereClause.insurance_number = { not: null }
    } else if (hasInsurance === 'false') {
      whereClause.insurance_number = null
    }

    // Availability filter (based on work_hours)
    if (isAvailable === 'true') {
      whereClause.work_hours = { not: null }
    }

    // Rating filter
    if (minRating) {
      const minRatingFloat = parseFloat(minRating)
      whereClause.reviews = {
        some: {
          rating: { gte: minRatingFloat }
        }
      }
    }

    // Build order by clause
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'experience') {
      orderBy.experience_years = sortOrder
    } else if (sortBy === 'rating') {
      orderBy.reviews = {
        _avg: {
          rating: sortOrder
        }
      }
    } else {
      orderBy.created_at = sortOrder
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute search with pagination
    const [artisans, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          proposals: {
            select: {
              id: true,
              status: true,
              demand: {
                select: {
                  id: true,
                  title: true,
                  category: true
                }
              }
            },
            take: 5,
            orderBy: { created_at: 'desc' }
          },
          _count: {
            select: {
              proposals: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    // Calculate average rating for each artisan
    const artisansWithRatings = artisans.map(artisan => {
      return {
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
        totalProposals: artisan._count.proposals,
        recentProposals: artisan.proposals,
        hasInsurance: !!artisan.insurance_number,
        isAvailable: !!artisan.work_hours
      }
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        artisans: artisansWithRatings,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPreviousPage,
          limit
        },
        filters: {
          query,
          category,
          department,
          location,
          minExperience,
          maxExperience,
          hasInsurance,
          isAvailable,
          minRating,
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
