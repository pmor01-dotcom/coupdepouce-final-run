import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createServerComponentClient({ cookies })

  const { data, error } = await supabase
    .from('artisans')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching artisans:', error)
    return Response.json(
      { error: 'Failed to fetch artisans' },
      { status: 500 }
    )
  }

  return Response.json(data)
}
