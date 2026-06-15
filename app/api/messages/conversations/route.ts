import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userIdNum = parseInt(userId)

    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userIdNum },
          { receiver_id: userIdNum }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            metier: true,
            location: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true,
            metier: true,
            location: true
          }
        },
        demand: {
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
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Group messages into conversations
    const conversationMap = new Map()

    messages.forEach(message => {
      const otherUserId = message.sender_id === userIdNum ? message.receiver_id : message.sender_id
      const demandId = message.demand_id || 0
      const conversationKey = `${Math.min(userIdNum, otherUserId)}-${Math.max(userIdNum, otherUserId)}-${demandId}`

      const otherUser = message.sender_id === userIdNum ? message.receiver : message.sender

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          conversationId: conversationKey,
          otherUser,
          demand: message.demand,
          lastMessage: {
            id: message.id,
            content: message.content,
            senderId: message.sender_id,
            createdAt: message.created_at
          },
          unreadCount: message.read_at === null && message.receiver_id === userIdNum ? 1 : 0
        })
      } else {
        const conv = conversationMap.get(conversationKey)
        // Update last message if this one is more recent
        if (new Date(message.created_at) > new Date(conv.lastMessage.createdAt)) {
          conv.lastMessage = {
            id: message.id,
            content: message.content,
            senderId: message.sender_id,
            createdAt: message.created_at
          }
        }
        // Update unread count
        if (message.read_at === null && message.receiver_id === userIdNum) {
          conv.unreadCount++
        }
      }
    })

    const conversations = Array.from(conversationMap.values())

    return NextResponse.json({
      success: true,
      conversations
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}
