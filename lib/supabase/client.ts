import { createBrowserClient } from "@supabase/ssr"

function getSupabaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }

  if (process.env.POSTGRES_URL) {
    try {
      const url = new URL(process.env.POSTGRES_URL)
      const projectRef = url.hostname.split(".")[0]
      return `https://${projectRef}.supabase.co`
    } catch (e) {
      console.error("[v0] Failed to extract Supabase URL from POSTGRES_URL:", e)
    }
  }

  throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is required")
}

function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
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
