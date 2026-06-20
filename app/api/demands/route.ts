export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies })

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user from Prisma to get the correct ID
    const prismaUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    const demands = await prisma.demand.findMany({
      where: { client_id: prismaUser.id },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(demands)
  } catch (error) {
    console.error('Error fetching demands:', error)
    return NextResponse.json({ error: 'Failed to fetch demands' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const body = await req.json()

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user from Prisma to get the correct ID
    const prismaUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
    }

    const { title, description, category, location, department, budget_range, urgency } = body

    const demand = await prisma.demand.create({
      data: {
        title,
        description,
        category,
        location,
        department,
        budget_range,
        urgency: urgency || 'NORMAL',
        client_id: prismaUser.id
      }
    })

    return NextResponse.json({ demand, message: 'Demand created successfully' })
  } catch (error) {
    console.error('Error creating demand:', error)
    return NextResponse.json({ error: 'Failed to create demand' }, { status: 500 })
  }
}
