import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId, content, demandId, conversationId } = body

    // Validate required fields
    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if this is the first message between these users about this demand
    const existingMessages = await prisma.message.findFirst({
      where: {
        OR: [
          { sender_id: senderId, receiver_id: receiverId, demand_id: demandId },
          { sender_id: receiverId, receiver_id: senderId, demand_id: demandId }
        ]
      }
    })

    // Business rule: Only clients can initiate contact
    if (!existingMessages) {
      const sender = await prisma.user.findUnique({
        where: { id: senderId }
      })

      if (!sender || sender.role !== 'CLIENT') {
        return NextResponse.json(
          { error: 'Only clients can initiate contact with artisans' },
          { status: 403 }
        )
      }

      // Verify the demand belongs to the client
      if (demandId) {
        const demand = await prisma.demand.findUnique({
          where: { id: demandId }
        })

        if (!demand || demand.client_id !== senderId) {
          return NextResponse.json(
            { error: 'You can only message about your own demands' },
            { status: 403 }
          )
        }
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        sender_id: senderId,
        receiver_id: receiverId,
        demand_id: demandId || null
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

    // Get demand title if demandId exists (TypeScript-safe)
    const demandTitle: string | null = demandId
      ? (
          await prisma.demand.findUnique({
            where: { id: demandId },
            select: { title: true }
          })
        )?.title || null
      : null

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
