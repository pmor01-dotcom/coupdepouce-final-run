import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  console.log("Fetching profile for user ID:", userId);

  const { data, error } = await supabase
    .from("users")
    .select(
      "id, name, email, phone, location, metier, role, photo_url, department"
    )
    .eq("id", userId)
    .eq("role", "ARTISAN")
    .single();

  if (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    console.error("No profile found for user:", userId);
    return NextResponse.json(
      { error: "Artisan profile not found" },
      { status: 404 }
    );
  }

  console.log("Profile data:", data);
  return NextResponse.json(data);
}
