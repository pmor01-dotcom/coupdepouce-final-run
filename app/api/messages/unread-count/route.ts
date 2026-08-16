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

    // Count all messages where the user is involved (either sender or receiver)
    // This gives the total number of messages in the user's conversations
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

    console.log('Messages count for user:', userId, 'Count:', count, 'Error:', error)

    if (error) {
      console.error('Error fetching unread count:', error)
      return NextResponse.json({ count: 0 })
    }

    console.log('Returning count:', count || 0)
    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ count: 0 })
  }
}
