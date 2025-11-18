import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "tktoot1@yahoo.com,tktut1@yahoo.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())

function getSupabaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }

  // Extract from POSTGRES_URL format: postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
  const postgresUrl = process.env.POSTGRES_URL || ""
  const match = postgresUrl.match(/postgres\.([^:]+).*@([^:]+)/)

  if (match) {
    const projectRef = match[1]
    return `https://${projectRef}.supabase.co`
  }

  throw new Error("Unable to determine Supabase URL. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.")
}

function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = getSupabaseUrl()
  const supabaseAnonKey = getSupabaseAnonKey()

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Supabase credentials missing:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    })
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: Always call getUser() to refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.email) {
    const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase())
    const role = isAdmin ? "admin" : "user"

    // Update user record with role and last login timestamp
    await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email,
          role: role,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )
      .then(({ error }) => {
        if (error) {
          console.error("[v0] Failed to sync user role:", error)
        }
      })
  }

  return supabaseResponse
}
