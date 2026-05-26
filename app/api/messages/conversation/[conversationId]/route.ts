import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Parse conversationId to get the two user IDs and demand ID
    const [user1Id, user2Id, demandId] = conversationId.split('-').map(Number)
    const currentUserId = parseInt(userId)

    // Validate that the current user is part of this conversation
    if (currentUserId !== user1Id && currentUserId !== user2Id) {
      return NextResponse.json(
        { error: 'Unauthorized to access this conversation' },
        { status: 403 }
      )
    }

    // Get all messages in this conversation
    const messages = await prisma.message.findMany({
      where: {
        demand_id: demandId,
        OR: [
          { sender_id: user1Id, receiver_id: user2Id },
          { sender_id: user2Id, receiver_id: user1Id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    })

    // Get conversation details
    const [otherUser, demand] = await Promise.all([
      prisma.user.findUnique({
        where: { id: currentUserId === user1Id ? user2Id : user1Id },
        select: {
          id: true,
          name: true,
          role: true,
          metier: true,
          location: true
        }
      }),
      prisma.demand.findUnique({
        where: { id: demandId },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          budget_range: true,
          location: true,
          department: true,
          status: true
        }
      })
    ])

    if (!otherUser || !demand) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Mark messages as read for the current user
    // Note: read_at field not in schema - skipping for now

    return NextResponse.json({
      success: true,
      conversation: {
        conversationId,
        otherUser,
        demand,
        messages: messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          createdAt: msg.created_at.toISOString(),
          sender: msg.sender,
          receiver: msg.receiver
        }))
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
