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
    const budgetRange = searchParams.get('budgetRange')
    const urgency = searchParams.get('urgency')
    const status = searchParams.get('status')
    const minBudget = searchParams.get('minBudget')
    const maxBudget = searchParams.get('maxBudget')
    const hasProposals = searchParams.get('hasProposals')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause for filtering
    const whereClause: any = {}

    // Text search across multiple fields
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
        { department: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ]
    }

    // Category filter
    if (category) {
      whereClause.category = { contains: category, mode: 'insensitive' }
    }

    // Location filters
    if (department) {
      whereClause.department = { contains: department, mode: 'insensitive' }
    }
    
    if (location) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { location: { contains: location, mode: 'insensitive' } }
      ]
    }

    // Budget filters
    if (budgetRange) {
      whereClause.budget_range = { contains: budgetRange, mode: 'insensitive' }
    }

    // Budget range filters
    if (minBudget || maxBudget) {
      const budgetConditions: any[] = []
      
      if (minBudget) {
        budgetConditions.push({
          budget_range: { contains: minBudget, mode: 'insensitive' }
        })
      }
      
      if (maxBudget) {
        budgetConditions.push({
          budget_range: { contains: maxBudget, mode: 'insensitive' }
        })
      }
      
      if (budgetConditions.length > 0) {
        whereClause.AND = budgetConditions
      }
    }

    // Urgency filter
    if (urgency) {
      whereClause.urgency = urgency
    }

    // Status filter
    if (status) {
      whereClause.status = status
    }

    // Proposals filter
    if (hasProposals === 'true') {
      whereClause.proposals = {
        some: {}
      }
    } else if (hasProposals === 'false') {
      whereClause.proposals = {
        none: {}
      }
    }

    // Build order by clause
    const orderBy: any = {}
    if (sortBy === 'title') {
      orderBy.title = sortOrder
    } else if (sortBy === 'budget') {
      orderBy.budget_range = sortOrder
    } else if (sortBy === 'urgency') {
      orderBy.urgency = sortOrder
    } else if (sortBy === 'proposals') {
      orderBy.proposals = {
        _count: sortOrder
      }
    } else {
      orderBy.created_at = sortOrder
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute search with pagination
    const [demands, totalCount] = await Promise.all([
      prisma.demand.findMany({
        where: whereClause,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          proposals: {
            select: {
              id: true,
              status: true,
              proposed_price: true,
              artisan: {
                select: {
                  id: true,
                  name: true,
                  metier: true
                }
              }
            },
            orderBy: { created_at: 'desc' },
            take: 5
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
      prisma.demand.count({ where: whereClause })
    ])

    // Process demands with additional calculated fields
    const processedDemands = demands.map(demand => {
      const proposals = demand.proposals || []
      const hasValidProposals = proposals.some(p => p.status === 'ACCEPTED')
      const pendingProposals = proposals.filter(p => p.status === 'PENDING')
      
      return {
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
        totalProposals: demand._count.proposals,
        pendingProposals: pendingProposals.length,
        hasValidProposals,
        recentProposals: proposals.slice(0, 3),
        urgency_level: demand.urgency === 'HIGH' ? 3 : demand.urgency === 'MEDIUM' ? 2 : 1
      }
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      data: {
        demands: processedDemands,
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
          budgetRange,
          urgency,
          status,
          minBudget,
          maxBudget,
          hasProposals,
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
