import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.json();
  const userId = request.headers.get("x-user-id") || body.id;

  console.log('=== UPDATE PROFILE DEBUG ===')
  console.log('User ID:', userId)
  console.log('Body:', body)

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
    console.error('Missing user ID')
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  // 1️⃣ UPDATE BASIC USER INFO (users table)
  console.log('Updating users table for ID:', userId)
  const { error: userError } = await supabase
    .from("users")
    .update({
      name,
      email
    })
    .eq("id", userId);

  if (userError) {
    console.error('User table update error:', userError)
    return NextResponse.json({ error: userError.message }, { status: 400 });
  }
  console.log('User table updated successfully')

  // 2️⃣ UPDATE ARTISAN PROFILE INFO (artisan_profiles table)
  console.log('Updating artisan_profiles table for ID:', userId)
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
    console.error('Artisan profile update error:', profileError)
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }
  console.log('Artisan profile updated successfully')

  console.log('=== UPDATE PROFILE COMPLETE ===')
  return NextResponse.json({ success: true });
}
