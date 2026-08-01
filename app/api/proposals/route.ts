import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import EmailService from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const artisanId = searchParams.get('artisanId');
    const demandId = searchParams.get('demandId');

    if (artisanId) {
      const { data: proposals, error } = await supabase
        .from('proposals')
        .select(`
          *,
          demand:demands (
            *,
            client:users!demands_client_id_fkey (
              id,
              name,
              location
            )
          )
        `)
        .eq('artisan_id', artisanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(proposals);
    }

    if (demandId) {
      const { data: proposals, error } = await supabase
        .from('proposals')
        .select(`
          *,
          artisan:users!proposals_artisan_id_fkey (
            id,
            name,
            metier,
            location,
            phone
          )
        `)
        .eq('demand_id', parseInt(demandId))
        .order('created_at', { ascending: false });

      if (error) throw error;
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

    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert({
        message,
        proposed_price,
        estimated_duration: estimated_duration || null,
        availability: availability || null,
        demand_id: parseInt(demand_id),
        artisan_id: artisan_id
      })
      .select(`
        *,
        artisan:users!proposals_artisan_id_fkey (
          id,
          name,
          metier,
          location,
          phone
        ),
        demand:demands (
          *,
          client:users!demands_client_id_fkey (
            id,
            name,
            location
          )
        )
      `)
      .single();

    if (error) throw error;

    console.log('Proposal created successfully, full data:', JSON.stringify(proposal, null, 2));

    // Send email notification to the client
    try {
      const clientEmail = proposal.demand?.client?.email;
      const clientName = proposal.demand?.client?.name;
      const artisanName = proposal.artisan?.name;
      const artisanMetier = proposal.artisan?.metier;
      const demandTitle = proposal.demand?.title;

      console.log('Email notification data:', {
        clientEmail,
        clientName,
        artisanName,
        artisanMetier,
        demandTitle,
        proposed_price,
        message
      });

      if (clientEmail && clientName && artisanName && demandTitle) {
        console.log('Attempting to send email to:', clientEmail);
        const emailResult = await EmailService.sendNewProposalEmail(
          clientEmail,
          clientName,
          artisanName,
          artisanMetier || 'Artisan',
          demandTitle,
          proposed_price,
          message
        );
        console.log('Email notification result:', emailResult);
      } else {
        console.log('Missing data for email notification:', {
          clientEmail,
          clientName,
          artisanName,
          demandTitle
        });
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

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
