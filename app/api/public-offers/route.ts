import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // Server-side environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json([], { status: 500 });
    }

    // Create Supabase client for server-side API route
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query the database
    const { data, error } = await supabase
      .from("demands")
      .select("id, title, location")
      .eq("status", "OPEN");

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json([], { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Public offers API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
