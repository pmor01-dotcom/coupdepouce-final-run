import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js'

let clientInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClientComponentClient()
  }
  return clientInstance
}
