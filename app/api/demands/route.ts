export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("demands")
      .select("id, title, category, location")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching public demands:", error);
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

    // Get user from header (sent by frontend)
    const userId = req.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("demands")
      .insert({
        client_id: userId,
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, demand: data })
  } catch (err: any) {
    console.error("Unexpected error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
