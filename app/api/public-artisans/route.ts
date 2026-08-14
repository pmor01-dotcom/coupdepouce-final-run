import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Fetch artisan profiles with user info (only public fields)
    const { data, error } = await supabase
      .from('artisan_profiles')
      .select(`
        id,
        trade,
        city,
        experience_years,
        specialties,
        description,
        photo_url,
        users!inner (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching public artisans:', error)
      return NextResponse.json([], { status: 200 })
    }

    // Transform data to remove personal details and format for display
    const publicArtisans = (data || []).map((artisan: any) => ({
      id: artisan.id,
      name: artisan.users?.name || 'Artisan',
      trade: artisan.trade,
      city: artisan.city,
      experience_years: artisan.experience_years,
      specialties: artisan.specialties,
      description: artisan.description,
      photo_url: artisan.photo_url
    }))

    return NextResponse.json(publicArtisans)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json([], { status: 200 })
  }
}
