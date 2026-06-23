import { NextRequest, NextResponse } from 'next/server'
import EmailService from '@/lib/email'


export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId, demandId, messageContent } = await request.json()

    if (!senderId || !receiverId || !demandId || !messageContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get sender and receiver information
    const [sender, receiver, demand] = await Promise.all([
      prisma.user.findUnique({ where: { id: parseInt(senderId) } }),
      prisma.user.findUnique({ where: { id: parseInt(receiverId) } }),
      prisma.demand.findUnique({ where: { id: parseInt(demandId) } })
    ])

    if (!sender || !receiver || !demand) {
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
