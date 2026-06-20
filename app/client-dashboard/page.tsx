import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function ClientDashboard() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not logged in → redirect to login
  if (!user) {
    redirect('/login')
  }

  // If logged in but not a client → redirect to artisan dashboard
  if (user.user_metadata.role !== 'client') {
    redirect('/artisan-dashboard')
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Tableau de bord Client</h1>
      <p>Bienvenue, {user.email}</p>
    </div>
  )
}
