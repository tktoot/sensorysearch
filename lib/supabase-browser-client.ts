import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

export function createBrowserClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
}
