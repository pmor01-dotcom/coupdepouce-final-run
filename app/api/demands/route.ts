import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic'

// In-memory storage for mock mode (resets on server restart)
let mockDemandsStore: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    // Force mock response for development to avoid slow database connections
    console.log('Using mock response for development (forced mode)');
    
    const mockDemands = [
      {
        id: 1,
        title: "Installation plomberie cuisine",
        description: "Besoin d'installer un nouveau évier et des tuyaux pour la cuisine",
        category: "Plomberie",
        location: "Toulouse",
        department: "31 - Haute-Garonne",
        budget_range: "500-800",
        urgency: "NORMAL",
        status: "OPEN",
        client_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client: {
          id: 1,
          name: "Jean Client",
          location: "Toulouse"
        },
        proposals: []
      },
        {
          id: 2,
          title: "Réparation toiture",
          description: "Fuite dans la toiture à réparer rapidement",
          category: "Couvreur",
          location: "Paris",
          department: "75 - Paris",
          budget_range: "1000-1500",
          urgency: "URGENT",
          status: "OPEN",
          client_id: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client: {
            id: 2,
            name: "Marie Client",
            location: "Paris"
          },
          proposals: []
        }
      ];
      
      if (clientId) {
        // Filter mock demands for specific client
        const clientDemands = mockDemands.filter(demand => demand.client_id === parseInt(clientId));
        
        // Also include any demands created by this user in the mock store
        const userCreatedDemands = mockDemandsStore.filter(demand => demand.client_id === parseInt(clientId));
        
        if (clientDemands.length === 0 && userCreatedDemands.length === 0) {
          // Create a sample demand for this client if none exist
          const sampleDemand = {
            id: 999,
            title: "Votre demande exemple",
            description: "Ceci est une demande exemple pour le client " + clientId,
            category: "Plomberie",
            location: "Votre ville",
            department: "Votre département",
            budget_range: "Non spécifié",
            urgency: "NORMAL",
            status: "OPEN",
            client_id: parseInt(clientId),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            client: {
              id: parseInt(clientId),
              name: "Vous",
              location: "Votre ville"
            },
            proposals: []
          };
          return NextResponse.json([sampleDemand]);
        }
        
        return NextResponse.json([...clientDemands, ...userCreatedDemands]);
      } else {
        // Return all demands (both hardcoded and user-created)
        const allDemands = [...mockDemands, ...mockDemandsStore];
        return NextResponse.json(allDemands);
      }

  } catch (error) {
    console.error('Get demands error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, location, department, budget_range, urgency, client_id } = await request.json();

    if (!title || !description || !category || !location || !department || !client_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try database connection first
    try {
      const demand = await prisma.demand.create({
        data: {
          title,
          description,
          category,
          location,
          department,
          budget_range: budget_range || null,
          urgency: urgency || 'NORMAL',
          client_id: parseInt(client_id)
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        }
      });

      return NextResponse.json({
        demand,
        message: 'Demand created successfully'
      });
    } catch (dbError) {
      // If database connection fails, provide mock response for development
      console.warn('Database connection failed, using mock response:', dbError);
      
      const mockDemand = {
        id: Date.now(), // Use timestamp for unique ID
        title,
        description,
        category,
        location,
        department,
        budget_range: budget_range || null,
        urgency: urgency || 'NORMAL',
        status: 'OPEN',
        client_id: parseInt(client_id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client: {
          id: parseInt(client_id),
          name: 'Mock Client',
          location: location
        },
        proposals: []
      };

      // Store the demand in memory for retrieval
      mockDemandsStore.push(mockDemand);

      return NextResponse.json({
        demand: mockDemand,
        message: 'Demand created successfully (mock mode)'
      });
    }

  } catch (error) {
    console.error('Create demand error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
