import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    const body = await request.json()

    const { senderId, receiverId, content, demandId } = body

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if previous messages exist between these users for this demand
    const { data: existingMessages } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId},demand_id.eq.${demandId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId},demand_id.eq.${demandId})`
      )
      .limit(1)

    // Business rule: only clients can initiate contact
    if (!existingMessages || existingMessages.length === 0) {
      const { data: sender } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', senderId)
        .single()

      if (!sender || sender.role !== 'client') {
        return NextResponse.json(
          { error: 'Only clients can initiate contact with artisans' },
          { status: 403 }
        )
      }

      // Verify demand belongs to the client
      if (demandId) {
        const { data: demand } = await supabase
          .from('demands')
          .select('id, client_id')
          .eq('id', demandId)
          .single()

        if (!demand || demand.client_id !== senderId) {
          return NextResponse.json(
            { error: 'You can only message about your own demands' },
            { status: 403 }
          )
        }
      }
    }

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
