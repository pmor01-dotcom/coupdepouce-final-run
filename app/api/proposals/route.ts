import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const artisanId = searchParams.get('artisanId');
    const demandId = searchParams.get('demandId');

    if (artisanId) {
      // Get proposals for specific artisan (UUID)
      const proposals = await prisma.proposal.findMany({
        where: { artisan_id: artisanId }, // UUID — no parseInt
        include: {
          demand: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  location: true
                }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      return NextResponse.json(proposals);
    }

    if (demandId) {
      // Get proposals for specific demand (INT)
      const proposals = await prisma.proposal.findMany({
        where: { demand_id: parseInt(demandId) },
        include: {
          artisan: {
            select: {
              id: true,
              name: true,
              metier: true,
              location: true,
              phone: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      return NextResponse.json(proposals);
    }

    return NextResponse.json([]);

  } catch (error) {
    console.error('Get proposals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      proposed_price,
      estimated_duration,
      availability,
      demand_id,
      artisan_id
    } = await request.json();

    if (!message || !proposed_price || !demand_id || !artisan_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const proposal = await prisma.proposal.create({
      data: {
        message,
        proposed_price,
        estimated_duration: estimated_duration || null,
        availability: availability || null,
        demand_id: parseInt(demand_id), // INT
        artisan_id: artisan_id          // UUID — no parseInt
      },
      include: {
        artisan: {
          select: {
            id: true,
            name: true,
            metier: true,
            location: true,
            phone: true
          }
        },
        demand: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                location: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      proposal,
      message: 'Proposal created successfully'
    });

  } catch (error) {
    console.error('Create proposal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
