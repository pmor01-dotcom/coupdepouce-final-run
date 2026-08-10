export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    // Check if user email is provided for filtering
    const userEmail = req.headers.get("x-user-email");

    let query = supabase
      .from("demands")
      .select("id, title, category, location, description, department, budget_range, status, created_at, users(name, email, phone)")
      .order("created_at", { ascending: false });

    // If user email is provided, filter by that user
    if (userEmail) {
      // Look up user by email to get their ID
      const { data: userCheck, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (userCheckError || !userCheck) {
        console.error("User not found:", userEmail, userCheckError);
        return NextResponse.json([], { status: 404 });
      }

      // Filter demands by user ID
      query = query.eq("client_id", userCheck.id);
    } else {
      // Limit to 10 for public view
      query = query.limit(10);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching demands:", error);
      return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, category, location, department, budget_range } = body

    // Get user email from header (sent by frontend)
    const userEmail = req.headers.get("x-user-email")

    if (!userEmail) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log("Creating demand for user email:", userEmail)

    // Look up user by email to get their ID
    const { data: userCheck, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userEmail)
      .single()

    if (userCheckError || !userCheck) {
      console.error("User not found in database:", userEmail, userCheckError)
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

    console.log("User found in database:", userCheck.id, "type:", typeof userCheck.id)

    const { data, error } = await supabase
      .from("demands")
      .insert({
        client_id: userCheck.id,
        title,
        description,
        category,
        location,
        department,
        budget_range,
        status: 'OPEN'
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating demand:", error)
      console.error("Error details:", JSON.stringify(error, null, 2))
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, demand: data })
  } catch (err: any) {
    console.error("Unexpected error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const demandId = searchParams.get('id')

    if (!demandId) {
      return NextResponse.json(
        { error: 'Missing demand id' },
        { status: 400 }
      )
    }

    console.log('Deleting demand:', demandId)

    // First, delete all proposals related to this demand
    const { error: proposalsError, count: proposalsCount } = await supabase
      .from('proposals')
      .delete()
      .eq('demand_id', demandId)

    if (proposalsError) {
      console.error('Error deleting proposals:', proposalsError)
      // Continue with demand deletion even if proposals deletion fails
    } else {
      console.log('Deleted proposals for demand:', demandId, 'Count:', proposalsCount)
    }

    // Then delete the demand
    const { error } = await supabase
      .from('demands')
      .delete()
      .eq('id', demandId)

    if (error) {
      console.error('Error deleting demand:', error)
      throw error
    }

    console.log('Successfully deleted demand:', demandId)

    return NextResponse.json({
      message: 'Demand and related proposals deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete demand error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
