import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { senderId, receiverId, content, demandId, conversationId } = await request.json()

    if (!senderId || !receiverId || !content || !demandId) {
      return NextResponse.json(
        { error: 'Missing required fields: senderId, receiverId, content, demandId' },
        { status: 400 }
      )
    }

    // Get sender and receiver information to validate roles
    const [sender, receiver, demand] = await Promise.all([
      prisma.user.findUnique({ where: { id: parseInt(senderId) } }),
      prisma.user.findUnique({ where: { id: parseInt(receiverId) } }),
      prisma.demand.findUnique({ 
        where: { id: parseInt(demandId) },
        include: { client: true }
      })
    ])

    if (!sender || !receiver || !demand) {
      return NextResponse.json(
        { error: 'Invalid sender, receiver, or demand' },
        { status: 400 }
      )
    }

    // BUSINESS RULE: Only clients can initiate contact with artisans
    // Check if this is the first message in the conversation
    const existingMessages = await prisma.message.findFirst({
      where: {
        OR: [
          { sender_id: parseInt(senderId), receiver_id: parseInt(receiverId) },
          { sender_id: parseInt(receiverId), receiver_id: parseInt(senderId) }
        ]
      }
    })

    if (!existingMessages) {
      // This is the first message - validate that sender is a client
      if (sender.role !== 'CLIENT') {
        return NextResponse.json(
          { error: 'Only clients can initiate contact with artisans' },
          { status: 403 }
        )
      }

      // Validate that the demand belongs to the client sender
      if (demand.client_id !== parseInt(senderId)) {
        return NextResponse.json(
          { error: 'You can only message artisans about your own demands' },
          { status: 403 }
        )
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        sender_id: parseInt(senderId),
        receiver_id: parseInt(receiverId),
        demand_id: parseInt(demandId),
        created_at: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      messageId: message.id,
      message: {
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        demandId: message.demand_id,
        createdAt: message.created_at.toISOString(),
        sender: message.sender
      },
      demandTitle: demand.title
    })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
