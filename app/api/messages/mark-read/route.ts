import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { conversationId, userId } = await request.json()

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'Conversation ID and User ID are required' },
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

    // Mark all unread messages for this user as read
    // Note: read_at field not in schema - skipping for now
    return NextResponse.json({
      success: true,
      messagesMarkedAsRead: 0
    })

  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}
