import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

// Helper: validate session token and return artisan user
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  // Look up user by session token
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("user_id")
    .eq("token", token)
    .single();

  if (sessionError || !session) return null;

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user_id)
    .single();

  if (userError || !user) return null;

  return user;
}

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
            id,
            title,
            location,
            department,
            client_id,
            client:users (
              id,
              name
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
          artisan:users (
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
    // ⭐ Authenticate artisan
    const artisan = await getAuthenticatedUser(request);

    if (!artisan) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour soumettre une proposition' },
        { status: 401 }
      );
    }

    if (!artisan.role || artisan.role.toLowerCase() !== "artisan") {
      return NextResponse.json(
        { error: "Seuls les artisans peuvent envoyer une proposition" },
        { status: 403 }
      );
    }

    const {
      message,
      proposed_price,
      estimated_duration,
      availability,
      demand_id
    } = await request.json();

    if (!message || !proposed_price || !demand_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ⭐ Insert proposal with authenticated artisan_id
    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert({
        message,
        proposed_price,
        estimated_duration: estimated_duration || null,
        availability: availability || null,
        demand_id,
        artisan_id: artisan.id,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // ⭐ Send message to client
    const { data: demand } = await supabase
      .from('demands')
      .select('id, title, client_id')
      .eq('id', demand_id)
      .single();

    if (demand && demand.client_id) {
      const messageContent = `Nouvelle proposition pour "${demand.title}": ${message}\n\nPrix proposé: ${proposed_price}`;

      await supabase.from('messages').insert({
        sender_id: artisan.id,
        receiver_id: demand.client_id,
        content: messageContent
      });
    }

    return NextResponse.json({
      proposal,
      message: 'Proposal created successfully'
    });

  } catch (error: any) {
    console.error('Create proposal error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('id');

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Missing proposal id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', proposalId);

    if (error) throw error;

    return NextResponse.json({
      message: 'Proposal deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete proposal error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
