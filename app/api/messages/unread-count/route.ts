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

    // Count all messages where the user is the receiver
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', userId)

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ count: 0 })
    }

    const count = messages?.length || 0
    console.log('Total messages received by user:', userId, 'Count:', count)

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ count: 0 })
  }
}
