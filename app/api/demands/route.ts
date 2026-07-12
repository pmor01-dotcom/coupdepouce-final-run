export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// =========================
// GET — Fetch all demands for logged-in user
// =========================
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch demands belonging to this user with client contact info
    const { data: demands, error: demandsError } = await supabase
      .from("demands")
      .select(`
        *,
        users!demands_client_id_fkey (
          name,
          email,
          phone
        )
      `)
      .eq("client_id", user.id);

    if (demandsError) {
      console.error("Error fetching demands:", demandsError);
      return NextResponse.json(
        { error: "Failed to fetch demands" },
        { status: 500 }
      );
    }

    return NextResponse.json(demands);
  } catch (error) {
    console.error("Error fetching demands:", error);
    return NextResponse.json(
      { error: "Failed to fetch demands" },
      { status: 500 }
    );
  }
}

// =========================
// POST — Create a new demand
// =========================
export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await req.json();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const {
      title,
      description,
      category,
      location,
      department,
      budget_range,
      urgency,
    } = body;

    // Insert demand into Supabase
    const { data: demand, error: insertError } = await supabase
      .from("demands")
      .insert({
        title,
        description,
        category,
        location,
        department,
        budget_range,
        urgency: urgency || "NORMAL",
        client_id: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create demand" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      demand,
      message: "Demand created successfully",
    });
  } catch (error) {
    console.error("Error creating demand:", error);
    return NextResponse.json(
      { error: "Failed to create demand" },
      { status: 500 }
    );
  }
}
