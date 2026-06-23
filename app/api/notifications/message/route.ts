import { NextRequest, NextResponse } from 'next/server'
import EmailService from '@/lib/email'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies: () => cookies() })
    const { senderId, receiverId, demandId, messageContent } = await request.json()

    if (!senderId || !receiverId || !demandId || !messageContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch sender
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', senderId)
      .single()

    // Fetch receiver
    const { data: receiver, error: receiverError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', receiverId)
      .single()

    // Fetch demand
    const { data: demand, error: demandError } = await supabase
      .from('demands')
      .select('id, title')
      .eq('id', demandId)
      .single()

    if (senderError || receiverError || demandError || !sender || !receiver || !demand) {
      return NextResponse.json(
        { error: 'Invalid sender, receiver, or demand' },
        { status: 400 }
      )
    }

    // Send email notification to receiver
    const emailSent = await EmailService.sendNewMessageEmail(
      receiver.email,
      receiver.name,
      sender.name,
      demand.title
    )

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Message notification sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send message notification' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Message notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
