import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Public client (browser-safe)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

// Admin client (server-only)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false
  }
})
