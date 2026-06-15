import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Parse conversation ID to get user IDs and demand ID
    const [id1, id2, demandId] = conversationId.split('-').map(Number)
    
    // Verify user is part of this conversation
    if (userIdNum !== id1 && userIdNum !== id2) {
      return NextResponse.json(
        { error: 'Unauthorized access to conversation' },
        { status: 403 }
      )
    }

    // Get all messages for this conversation
    const messages = await prisma.message.findMany({
      where: {
        demand_id: demandId || null,
        OR: [
          { sender_id: id1, receiver_id: id2 },
          { sender_id: id2, receiver_id: id1 }
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

    // Get demand info if demandId exists
    let demand = null
    if (demandId) {
      demand = await prisma.demand.findUnique({
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
    }

    // Get other user info
    const otherUserId = userIdNum === id1 ? id2 : id1
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        name: true,
        role: true,
        metier: true,
        location: true
      }
    })

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
          createdAt: msg.created_at,
          readAt: msg.read_at,
          sender: msg.sender
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
