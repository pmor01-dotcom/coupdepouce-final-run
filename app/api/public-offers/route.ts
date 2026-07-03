import { NextResponse } from "next/server"
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createSupabaseServerClient()

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
