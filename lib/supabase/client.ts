import { createBrowserClient } from "@supabase/ssr"

function getSupabaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }

  // For client-side, we need the URL to be available at build time
  // This is a fallback that won't work in all cases but prevents immediate errors
  throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is required")
}

function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
}

export function createClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()

  if (!url || !key) {
    throw new Error("Supabase URL and Anon Key are required")
  }

  return createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}
