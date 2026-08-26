'use client';

import { getSupabaseClient } from './supabase-client';

// Re-export the singleton for backward compatibility
export const supabase = getSupabaseClient();
