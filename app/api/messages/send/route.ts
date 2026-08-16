import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import EmailService from '@/lib/email'

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

    // Verify both users exist and get their details
    const { data: sender } = await supabase
      .from('users')
      .select('id, role, name, email')
      .eq('id', senderId)
      .limit(1)

    const { data: receiver } = await supabase
      .from('users')
      .select('id, role, name, email')
      .eq('id', receiverId)
      .limit(1)

    if (!sender || sender.length === 0 || !receiver || receiver.length === 0) {
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
    console.log('Inserting message:', { senderId, receiverId, content })
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        content,
        sender_id: senderId,
        receiver_id: receiverId
      })
      .select()
      .limit(1)

    console.log('Message insert result:', message, messageError)

    if (messageError) {
      console.error('Message insert error:', messageError)
      return NextResponse.json(
        { error: messageError.message },
        { status: 400 }
      )
    }

    if (!message || message.length === 0) {
      console.error('No message returned from insert')
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      )
    }

    // Send email notification to receiver
    try {
      const senderData = sender[0]
      const receiverData = receiver[0]

      if (receiverData.email) {
        await EmailService.sendNewMessageEmail(
          receiverData.email,
          receiverData.name || 'Utilisateur',
          senderData.name || 'Utilisateur',
          senderData.role || 'artisan',
          content
        )
        console.log('Email notification sent to receiver:', receiverData.email)
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      messageId: message[0].id,
      message: message[0]
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
