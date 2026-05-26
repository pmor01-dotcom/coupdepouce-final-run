import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import EmailService from '../../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const { artisanId, demandId, proposalContent } = await request.json()

    if (!artisanId || !demandId || !proposalContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get artisan, demand, and client information
    const [artisan, demand] = await Promise.all([
      prisma.user.findUnique({ where: { id: parseInt(artisanId) } }),
      prisma.demand.findUnique({ 
        where: { id: parseInt(demandId) },
        include: {
          client: true
        }
      })
    ])

    if (!artisan || !demand || !demand.client) {
      return NextResponse.json(
        { error: 'Invalid artisan or demand' },
        { status: 400 }
      )
    }

    // Send email notification to client
    const emailSent = await EmailService.sendNewProposalEmail(
      demand.client.email,
      artisan.name,
      demand.title,
      demand.client.name
    )

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Proposal notification sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send proposal notification' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Proposal notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
