import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function requireEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function createSupabaseServerClient(): SupabaseClient {
  const url = requireEnvVar('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl)
  const anonKey = requireEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey)

  return createClient(url, anonKey, {
    auth: {
      persistSession: false
    }
  })
}

export function createSupabaseAdminClient(): SupabaseClient {
  const url = requireEnvVar('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl)
  const serviceKey = requireEnvVar('SUPABASE_SERVICE_ROLE_KEY', serviceRoleKey)

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false
    }
  })
}