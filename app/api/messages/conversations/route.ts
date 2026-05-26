import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get all conversations for the user
    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: parseInt(userId) },
          { receiver_id: parseInt(userId) }
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
        },
        demand: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Group messages by conversation (pair of users + demand)
    const conversationMap = new Map()

    conversations.forEach(message => {
      const otherUserId = message.sender_id === parseInt(userId) 
        ? message.receiver_id 
        : message.sender_id
      
      const conversationKey = `${Math.min(parseInt(userId), otherUserId)}-${Math.max(parseInt(userId), otherUserId)}-${message.demand_id}`
      
      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          conversationId: conversationKey,
          otherUser: message.sender_id === parseInt(userId) ? message.receiver : message.sender,
          demand: message.demand,
          lastMessage: message,
          unreadCount: 0
        })
      }

      // Count unread messages (read_at not in schema - skipping for now)
    })

    const result = Array.from(conversationMap.values()).map(conv => ({
      conversationId: conv.conversationId,
      otherUser: conv.otherUser,
      demand: conv.demand,
      lastMessage: {
        id: conv.lastMessage.id,
        content: conv.lastMessage.content,
        senderId: conv.lastMessage.sender_id,
        createdAt: conv.lastMessage.created_at.toISOString()
      },
      unreadCount: conv.unreadCount
    }))

    return NextResponse.json({
      success: true,
      conversations: result
    })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
