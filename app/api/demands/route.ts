import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// GET — fetch all demands for the logged-in client
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

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

// POST — create a new demand
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await req.json()

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('demands').insert({
    id: crypto.randomUUID(),
    client_id: user.id,
    title: body.title,
    description: body.description,
    category: body.category,
    location: body.location,
    department: body.department,
    budget_range: body.budget_range,
    urgency: body.urgency
  })

  if (error) {
    console.error('Error creating demand:', error)
    return Response.json({ error: 'Failed to create demand' }, { status: 400 })
  }

  return Response.json({ success: true })
}
