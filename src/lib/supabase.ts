import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(url && anonKey)

let clientPromise: Promise<SupabaseClient> | null = null

/**
 * Loads the Supabase client lazily so the library is only downloaded when a
 * project has actually been configured. Returns null for the local-only build.
 */
export function getSupabase(): Promise<SupabaseClient> | null {
  if (!url || !anonKey) return null

  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      }),
    )
  }

  return clientPromise
}
