import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import EmailService from '../../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    const { artisanId, demandId, proposalContent } = await request.json()

    if (!artisanId || !demandId || !proposalContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch artisan
    const { data: artisan, error: artisanError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', artisanId)
      .single()

    if (artisanError || !artisan) {
      return NextResponse.json(
        { error: 'Invalid artisan' },
        { status: 400 }
      )
    }

    // Fetch demand + client
    const { data: demand, error: demandError } = await supabase
      .from('demands')
      .select(`
        id,
        title,
        client:users!demands_client_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('id', demandId)
      .single()

    if (demandError || !demand || !demand.client) {
      return NextResponse.json(
        { error: 'Invalid demand' },
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

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send proposal notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Proposal notification sent successfully'
    })

  } catch (error) {
    console.error('Proposal notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
