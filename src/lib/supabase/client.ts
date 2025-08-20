// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

export function createClientSupabaseClient() {
  // Use environment variables or fallback to hardcoded values for development
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cvlotsrorgjqtrutlocp.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bG90c3JvcmdqcXRydXRsb2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NjU3NzksImV4cCI6MjA3MTE0MTc3OX0.gd_VKeH8oOs2SupNfxQJihBNqMbKCZuPii0ceo9dEpE'

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}