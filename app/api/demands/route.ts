export const dynamic = "force-dynamic";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Error fetching user:', userError)
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 })
  }

  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('demands')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching demands:', error)
    return Response.json({ error: 'Failed to fetch demands' }, { status: 500 })
  }

  return Response.json(data)
}

export async function POST(req: Request) {
  const supabase = createServerComponentClient({ cookies })
  const body = await req.json()

  return Response.json({ ok: true })
}
