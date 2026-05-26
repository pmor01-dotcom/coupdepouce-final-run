import { NextRequest, NextResponse } from 'next/server'

interface Artisan {
  id: number
  name: string
  email: string
  metier: string
  location: string
  department: string
  rating: number
  isAvailable: boolean
  isPaid: boolean
  subscription: {
    id: number
    type: string
    status: string
    start_date: string
    end_date: string
  } | null
}

interface Subscription {
  id: number
  type: string
  status: string
  start_date: string
  end_date: string
}

interface User {
  id: number
  name: string
  email: string
  metier: string
  location: string
  department: string
  subscriptions: Subscription[]
}

export async function GET(request: NextRequest) {
  try {
    // Mock data for development when database is not available
    const mockArtisans: Artisan[] = [
      {
        id: 1,
        name: 'Jean Plombier',
        email: 'jean.plombier@example.com',
        metier: 'Plomberie',
        location: 'Paris',
        department: '75 - Paris',
        rating: 4.8,
        isAvailable: true,
        isPaid: true,
        subscription: {
          id: 1,
          type: 'MONTHLY',
          status: 'ACTIVE',
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        }
      },
      {
        id: 2,
        name: 'Marie Électricienne',
        email: 'marie.electricien@example.com',
        metier: 'Électricité',
        location: 'Lyon',
        department: '69 - Rhône',
        rating: 4.6,
        isAvailable: true,
        isPaid: true,
        subscription: {
          id: 2,
          type: 'YEARLY',
          status: 'ACTIVE',
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        }
      },
      {
        id: 3,
        name: 'Pierre Menuisier',
        email: 'pierre.menuisier@example.com',
        metier: 'Menuiserie',
        location: 'Marseille',
        department: '13 - Bouches-du-Rhône',
        rating: 4.9,
        isAvailable: false,
        isPaid: false,
        subscription: null
      }
    ]

    return NextResponse.json(mockArtisans)
  } catch (error) {
    console.error('Error fetching artisans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artisans' },
      { status: 500 }
    )
  }
}
