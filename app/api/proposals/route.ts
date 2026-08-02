import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Send a message to the client about the new proposal
    try {
      const clientId = proposal.demand?.client?.id;
      const demandTitle = proposal.demand?.title;

      if (clientId && demandTitle) {
        const messageContent = `Nouvelle proposition pour "${demandTitle}": ${message}\n\nPrix proposé: ${proposed_price}`;

        await supabase.from('messages').insert({
          sender_id: artisan_id,
          receiver_id: clientId,
          content: messageContent,
          demand_id: parseInt(demand_id)
        });

        console.log('Message sent to client:', clientId);
      }
    } catch (messageError) {
      console.error('Failed to send message to client:', messageError);
      // Don't fail the request if message fails
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
