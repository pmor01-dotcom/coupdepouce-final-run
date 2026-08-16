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

    // Count messages where the artisan is the receiver and hasn't read them
    // For now, we'll count all messages received by the artisan
    // You can add a 'read' column to the messages table later for true unread tracking
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)

    console.log('Messages count for receiver:', userId, 'Count:', count, 'Error:', error)

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
