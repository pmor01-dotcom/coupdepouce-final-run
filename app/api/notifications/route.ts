import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      )
    }

    const notifications = await prisma.notification.findMany({
      where: {
        user_id: parseInt(userId)
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({ success: true, notifications })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationIds, userId } = body

    if (!Array.isArray(notificationIds) || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds.map((id: any) => parseInt(id)) },
        user_id: parseInt(userId)
      },
      data: {
        is_read: true
      }
    })

    return NextResponse.json({ success: true, message: 'Notifications marked read' })
  } catch (error) {
    console.error('Notifications update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
