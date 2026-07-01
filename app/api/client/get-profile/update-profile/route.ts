import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await request.json();

  const { id, name, email, phone, ville } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update({
      name,
      email,
      phone,
      location: ville
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
