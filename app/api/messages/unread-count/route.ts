import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    console.log('=== UNREAD COUNT API DEBUG ===')
    console.log('User ID:', userId)

    if (!userId) {
      console.log('Missing userId')
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Count conversations where the last message was sent TO the user (unanswered)
    // Get all conversations for the user
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ count: 0 })
    }

    // Group messages by conversation (unique pairs of users)
    const conversations = new Map<string, any[]>()
    messages?.forEach(message => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id
      const conversationKey = [userId, otherUserId].sort().join('-')
      if (!conversations.has(conversationKey)) {
        conversations.set(conversationKey, [])
      }
      conversations.get(conversationKey)?.push(message)
    })

    // Count conversations where the last message was sent TO the user
    let unansweredCount = 0
    conversations.forEach((conversationMessages) => {
      const lastMessage = conversationMessages[conversationMessages.length - 1]
      if (lastMessage.receiver_id === userId) {
        unansweredCount++
      }
    })

    console.log('Unanswered conversations count for user:', userId, 'Count:', unansweredCount)

    return NextResponse.json({ count: unansweredCount })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ count: 0 })
  }
}
