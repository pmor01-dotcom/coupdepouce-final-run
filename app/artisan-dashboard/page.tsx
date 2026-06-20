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

  // TypeScript doesn't understand redirect exits, so we assert user is non-null
  const safeUser = user!

  // If wrong role → redirect to client dashboard
  if (safeUser.user_metadata.role !== 'artisan') {
    redirect('/client-dashboard')
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Artisan Dashboard</h1>
      <p>Welcome, {safeUser.email}</p>
    </div>
  )
}
