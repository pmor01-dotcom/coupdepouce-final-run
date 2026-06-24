import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data, error } = await supabase
    .from("demands")
    .select("id, title, location")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
