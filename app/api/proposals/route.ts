import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() });
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
    const supabase = createRouteHandlerClient({ cookies: () => cookies() });
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
