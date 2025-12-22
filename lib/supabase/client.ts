import { createBrowserClient } from "@supabase/ssr"

function getSupabaseUrl(): string {
  console.log("[v0] SUPABASE_CLIENT: Checking for NEXT_PUBLIC_SUPABASE_URL...")
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log("[v0] SUPABASE_CLIENT: Using NEXT_PUBLIC_SUPABASE_URL")
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }

  console.log("[v0] SUPABASE_CLIENT: NEXT_PUBLIC_SUPABASE_URL not found, trying POSTGRES_URL...")
  
  if (process.env.POSTGRES_URL) {
    try {
      const url = new URL(process.env.POSTGRES_URL)
      const projectRef = url.hostname.split(".")[0]
      const supabaseUrl = `https://${projectRef}.supabase.co`
      console.log("[v0] SUPABASE_CLIENT: Extracted URL from POSTGRES_URL:", supabaseUrl)
      return supabaseUrl
    } catch (e) {
      console.error("[v0] SUPABASE_CLIENT: Failed to extract Supabase URL from POSTGRES_URL:", e)
    }
  }

  console.error("[v0] SUPABASE_CLIENT: No URL found in environment variables")
  throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is required")
}

function getSupabaseAnonKey(): string {
  console.log("[v0] SUPABASE_CLIENT: Checking for anon key...")
  
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
  
  if (key) {
    console.log("[v0] SUPABASE_CLIENT: Anon key found")
  } else {
    console.error("[v0] SUPABASE_CLIENT: No anon key found")
  }
  
  return key
}

export function createClient() {
  console.log("[v0] SUPABASE_CLIENT: Creating Supabase client...")
  
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()

  if (!url || !key) {
    console.error("[v0] SUPABASE_CLIENT: Missing credentials", { hasUrl: !!url, hasKey: !!key })
    throw new Error("Supabase URL and Anon Key are required")
  }

  console.log("[v0] SUPABASE_CLIENT: Client created successfully")

  return createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}
