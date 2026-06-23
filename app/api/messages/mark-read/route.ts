import { NextRequest, NextResponse } from 'next/server'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, userId } = body

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Mark all messages where this user is the receiver as read
    const updatedMessages = await prisma.message.updateMany({
      where: {
        receiver_id: userIdNum,
        demand_id: demandId || null,
        OR: [
          { sender_id: id1, receiver_id: id2 },
          { sender_id: id2, receiver_id: id1 }
        ],
        read_at: null
      },
      data: {
        read_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      updatedCount: updatedMessages.count
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}
