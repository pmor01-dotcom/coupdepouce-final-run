import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseAdminClient()
  try {
    const conversationId = params.id
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userIdNum = parseInt(userId)

    // Parse conversation ID: "id1-id2-demandId"
    const [id1, id2, demandId] = conversationId.split('-').map(Number)

    // Verify user is part of this conversation
    if (userIdNum !== id1 && userIdNum !== id2) {
      return NextResponse.json(
        { error: 'Unauthorized access to conversation' },
        { status: 403 }
      )
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        receiver_id,
        created_at,
        read_at,
        sender:sender_id (
          id,
          name,
          role
        ),
        receiver:receiver_id (
          id,
          name,
          role
        )
      `)
      .eq('demand_id', demandId || null)
      .or(`and(sender_id.eq.${id1},receiver_id.eq.${id2}),and(sender_id.eq.${id2},receiver_id.eq.${id1})`)
      .order('created_at', { ascending: true })

    if (msgError) {
      return NextResponse.json(
        { error: msgError.message },
        { status: 500 }
      )
    }

    // Fetch demand info
    let demand: any= null
    if (demandId) {
      const { data, error } = await supabase
        .from('demands')
        .select(`
          id,
          title,
          description,
          category,
          budget_range,
          location,
          department,
          status
        `)
        .eq('id', demandId)
        .single()

      if (!error) demand = data
    }

    // Fetch the other user
    const otherUserId = userIdNum === id1 ? id2 : id1
    const { data: otherUser } = await supabase
      .from('users')
      .select(`
        id,
        name,
        role,
        metier,
        location
      `)
      .eq('id', otherUserId)
      .single()

    return NextResponse.json({
      success: true,
      conversation: {
        conversationId,
        otherUser,
        demand,
        messages: messages?.map(msg => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          createdAt: msg.created_at,
          readAt: msg.read_at,
          sender: msg.sender
        })) || []
      }
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}
