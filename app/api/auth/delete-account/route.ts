import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId } = body

    console.log('=== DELETE ACCOUNT REQUEST ===')
    console.log('User ID:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    // Get user role before deletion
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('User not found:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('User role:', user.role)

    // Delete user's messages
    console.log('Deleting messages for user:', userId)
    await supabase
      .from('messages')
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

    // Delete user's proposals
    console.log('Deleting proposals for user:', userId)
    await supabase
      .from('proposals')
      .delete()
      .eq('artisan_id', userId)

    // Delete user's demands (if client)
    if (user.role === 'client') {
      console.log('Deleting demands for client:', userId)
      await supabase
        .from('demands')
        .delete()
        .eq('client_id', userId)
    }

    // Delete artisan profile (if artisan)
    if (user.role === 'artisan') {
      console.log('Deleting artisan profile for user:', userId)
      await supabase
        .from('artisan_profiles')
        .delete()
        .eq('id', userId)
    }

    // Delete user from users table
    console.log('Deleting user from users table:', userId)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    console.log('Account deleted successfully for user:', userId)

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    })
  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
