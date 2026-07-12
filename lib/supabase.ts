import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

function createSafeSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  })
}

const supabaseClient = createSafeSupabaseClient()

export const supabase = supabaseClient ?? {
  auth: {
    async signOut() { return { data: null, error: new Error('Supabase client not configured') } },
    async signInWithPassword(_: any) { return { data: null, error: new Error('Supabase client not configured') } }
  }
} as unknown as SupabaseClient