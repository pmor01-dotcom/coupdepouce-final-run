import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { senderId, receiverId, content, demandId } = body

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify both users exist
    const { data: sender } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', senderId)
      .single()

    const { data: receiver } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', receiverId)
      .single()

    if (!sender || !receiver) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // If this is the first message and there's a demand, verify the relationship
    const { data: existingMessages } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
      )
      .limit(1)

    // No business rule restrictions - allow any user to message any other user
    // This enables artisans to message clients and vice versa

    // Create the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        content,
        sender_id: senderId,
        receiver_id: receiverId,
        demand_id: demandId || null
      })
      .select(
        `
        id,
        content,
        sender:users!messages_sender_id_fkey(id, name, role)
        `
      )
      .single()

    if (messageError) {
      return NextResponse.json(
        { error: messageError.message },
        { status: 400 }
      )
    }

    // Fetch demand title if needed
    let demandTitle = null
    if (demandId) {
      const { data: demand } = await supabase
        .from('demands')
        .select('title')
        .eq('id', demandId)
        .single()

      demandTitle = demand?.title || null
    }

    return NextResponse.json({
      success: true,
      messageId: message.id,
      message,
      sender: message.sender,
      demandTitle
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
