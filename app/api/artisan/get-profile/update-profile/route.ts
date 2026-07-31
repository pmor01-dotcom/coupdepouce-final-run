import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await request.json();
  const userId = request.headers.get("x-user-id") || body.id;

  const {
    id,
    name,
    email,
    description,
    experience_years,
    specialties,
    phone,
    location,
    metier,
    photo_url
  } = body;

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  // 1️⃣ UPDATE BASIC USER INFO (users table)
  const { error: userError } = await supabase
    .from("users")
    .update({
      name,
      email
    })
    .eq("id", userId);

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }

  // 2️⃣ UPDATE ARTISAN PROFILE INFO (artisan_profiles table)
  const { error: profileError } = await supabase
    .from("artisan_profiles")
    .update({
      phone,
      city: location,
      trade: metier,
      description,
      experience_years,
      specialties,
      photo_url
    })
    .eq("id", userId);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
