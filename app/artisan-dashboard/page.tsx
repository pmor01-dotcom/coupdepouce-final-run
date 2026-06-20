import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ArtisanDashboard() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user → redirect to login
  if (!user) {
    redirect('/login')
  }

  // If wrong role → redirect to client dashboard
  if (user.user_metadata?.role !== 'artisan') {
    redirect('/client-dashboard')
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Artisan Dashboard</h1>
      <p>Welcome, {user.email}</p>
    </div>
  )
}
