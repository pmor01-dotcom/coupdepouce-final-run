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
        .eq('demand_id', demandId)
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
        demand_id: demand_id,
        artisan_id: artisan_id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Send a message to the client about the new proposal
    try {
      // Fetch demand to get client_id and title
      const { data: demand } = await supabase
        .from('demands')
        .select('id, title, client_id')
        .eq('id', demand_id)
        .single();

      if (demand && demand.client_id) {
        const messageContent = `Nouvelle proposition pour "${demand.title}": ${message}\n\nPrix proposé: ${proposed_price}`;

        await supabase.from('messages').insert({
          sender_id: artisan_id,
          receiver_id: demand.client_id,
          content: messageContent,
          demand_id: demand_id
        });

        console.log('Message sent to client:', demand.client_id);
      }
    } catch (messageError) {
      console.error('Failed to send message to client:', messageError);
      // Don't fail the request if message fails
    }

    return NextResponse.json({
      proposal,
      message: 'Proposal created successfully'
    });

  } catch (error: any) {
    console.error('Create proposal error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: error.message || 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
