import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('demands')
      .select('id, title, category, location, description, budget_range, urgency, client_id')
      .limit(50)

    if (error) {
      console.error('Error fetching public demands:', error)
      return NextResponse.json([], { status: 200 })
    }

    // Fetch user information separately for each demand
    const demandsWithUsers = await Promise.all(
      (data || []).map(async (demand) => {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, name, phone')
          .eq('id', demand.client_id)
          .single()
        
        if (userError) {
          console.error(`Error fetching user for demand ${demand.id}:`, userError)
        }
        
        return {
          ...demand,
          users: userData || null
        }
      })
    )

    return NextResponse.json(demandsWithUsers)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json([], { status: 200 })
  }
}
