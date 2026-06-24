import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from("demands")
    .select("id, title, location")
    .eq("status", "OPEN")

  if (error) {
    console.error(error)
    return NextResponse.json([], { status: 500 })
  }

  return NextResponse.json(data)
}
